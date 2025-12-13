use actix_files::{Files, NamedFile};
use actix_multipart::form::MultipartFormConfig;
use actix_session::{config::PersistentSession, storage::CookieSessionStore, SessionMiddleware};
use actix_web::{
  cookie::{self, Key},
  middleware, web, App, HttpRequest, HttpServer, Result,
};
// use openssl::{
//   pkey::{PKey, Private},
//   ssl::{SslAcceptor, SslMethod},
// };
use sea_orm::{ConnectOptions, Database, DatabaseConnection};
use std::{
  env,
  path::{Path, PathBuf},
  time::Duration,
};
use tokio::sync::broadcast;

mod api;
mod ebrd;
mod ebrd_app;
mod emcall_app;
mod entities;
mod gate_app;
mod gconf;
mod index;
mod models;
mod mw;
mod ndms;
mod rtsp;
mod sms;
mod sock;
mod svc;
mod syslog;
mod util;
mod water;
mod ws;

#[derive(Debug, Clone)]
pub struct AppState {
  // #[allow(dead_code)]
  // templates: tera::Tera,
  #[allow(dead_code)]
  conn: DatabaseConnection,
  tx_gate: tokio::sync::mpsc::Sender<Box<dyn gate_app::IfGateCmd>>,
  tx_ws: broadcast::Sender<Box<String>>,
}

#[derive(Debug, Clone)]
#[allow(dead_code)]
pub struct GateCtx {
  conn: DatabaseConnection,
  tx_ws: broadcast::Sender<Box<String>>,
}
//
// #[derive(Debug, Clone)]
// pub struct WsState {
//   tx: broadcast::Sender<Box<String>>,
// }

//const BUILD_TIME: &str = env!("VERGEN_BUILD_TIMESTAMP");

async fn custom_file_handler(req: HttpRequest) -> Result<NamedFile> {
  let path: PathBuf = req.match_info().query("path").parse().unwrap_or_default();
  let base = Path::new("../bnsweb/out"); // 파일이 저장된 폴더

  //log::error!("path: {}", path.display());
  // 1. 요청한 파일 먼저 시도
  let mut file_path = base.join(&path);
  if file_path.is_file() {
    return Ok(NamedFile::open(file_path)?.use_last_modified(true));
  }

  if file_path.is_dir() && path == PathBuf::from("") {
    file_path = file_path.join("index.html");
    return Ok(NamedFile::open(file_path)?.use_last_modified(true));
  }

  // 2. .html 확장자 붙여서 시도
  file_path.set_extension("html");
  if file_path.is_file() {
    return Ok(NamedFile::open(file_path)?.use_last_modified(true));
  }

  // 3. 둘 다 없으면 404

  log::error!("File not found: {}", file_path.display());

  Err(actix_web::error::ErrorNotFound("File not found"))
}

// fn is_api_or_ws(ctx: &guard::GuardContext) -> bool {
//   let path = ctx.head().uri.path();
//   path.starts_with("/api") || path.starts_with("/ws")
// }

fn get_logger() -> middleware::Logger {
  let mut logger = middleware::Logger::new(
    //r#"%a "%r" %s %b "%{Referer}i" "%{User-Agent}i" %T"#,
    //r#"%{r}a "%r" %s %b "%{Referer}i" "%{User-Agent}i" %T"#,
    r#"===== %{r}a "%r" %s %b %T ====="#,
    //"%U",
  )
  //.exclude_regex(r"^(?!\/api\/|\/ws\/).*$"), // /api/와 /ws/로 시작하지 않는 모든 경로 제외
  //.exclude_regex(r"^[^(/api/)]"),
  ;
  let paths = vec![
    "^/_next/",
    "^/images/",
    "^/ndms/",
    "^/dashbd/",
    "^/settings/",
    "^/audio/",
    "^/scripts/",
  ];
  for path in paths {
    logger = logger.exclude_regex(path);
  }

  let paths = vec![
    "/403",
    "/404",
    "/camera",
    "/favicon.icon",
    "/gate",
    "/index",
    "/dashbd",
    "/login",
    "/ndms",
    "/settings",
    "/water",
  ];
  for path in paths {
    let path_txt = format!("{path}.txt");
    logger = logger.exclude(path).exclude(path_txt);
  }

  logger
}

fn get_local_build_time() -> String {
  let timestamp = option_env!("VERGEN_BUILD_TIMESTAMP");
  if let Some(timestamp) = timestamp {
    use chrono::{DateTime, Local};
    let dt = DateTime::parse_from_rfc3339(timestamp)
      .map(|dt| dt.with_timezone(&Local))
      .unwrap_or_else(|_| Local::now());
    return dt.format("%Y-%m-%d %H:%M:%S").to_string();
  }
  "".to_string()
}

fn print_env() {
  let keys = vec![
    "PORT",
    "WS_PORT",
    "SMS_SENDER_PHONE",
    "SMS_ENABLE",
    "ENABLE_GATE_STATUS_CHECK=",
    "ENABLE_WATER_STATUS_CHECK",
    "BNS_DOTENV",
    "LOG4RS_FILE",
    "SQLX_LOG",
    //"GATE_CHECK_SECS",
    "WATER_ERR_SECS",
    "NDMS_ENABLE",
    "EMCALL_ENABLE",
    "EBRD_ENABLE",
    "BNSSVR_BASE_URL",
    "FFMPEG_LOG_LEVEL",
  ];
  for (key, value) in env::vars() {
    if !keys.contains(&key.as_str()) {
      continue;
    }
    log::info!("{}: {}", key, value);
  }
}

fn print_env_file(env_file: &str) {
  if true {
    log::info!(" ** 환경변수 START");
    log::info!("설정파일 : {env_file}");
    print_env();
    log::info!(" ** 환경변수 END");
    return;
  }
  let env_path = PathBuf::from(env_file);
  let contents = match std::fs::read_to_string(&env_path) {
    Ok(contents) => contents,
    Err(e) => {
      log::error!("환경설정 파일을 읽는데 실패했습니다: {env_file} {}", e);
      return;
    }
  };

  log::info!(" ** 환경설정 파일 START : {env_file}");
  for line in contents.lines() {
    if line.starts_with("#") || line.trim().is_empty() {
      continue;
    }
    log::info!("{}", line.trim());
  }
  log::info!(" ** 환경설정 파일 END : {env_file}");
}
//#[actix_web::main]
async fn start(enable_https: bool) -> std::io::Result<()> {
  let port = env::var("PORT").unwrap_or("8080".to_owned()).parse::<u16>().unwrap_or(8080);
  // for (key, value) in env::vars() {
  //     println!("{}: {}", key, value);
  // }
  let db_url = env::var("DATABASE_URL").expect("DATABASE_URL is not set in .env file");

  //log::info!("BUILD_TIME2 : {BUILD_TIME}");

  log::info!("BUILD_TIME : {}", get_local_build_time());

  log::info!("서비스포트 : {port}");
  //log::info!("DB URL : {db_url}");
  let sqlxlog = crate::util::get_env_bool("SQLX_LOG", true);
  let mut opt = ConnectOptions::new(db_url);
  opt
    // .max_connections(20)
    // .min_connections(5)
    // .connect_timeout(Duration::from_secs(8))
    // .acquire_timeout(Duration::from_secs(8))
    // .idle_timeout(Duration::from_secs(8))
    // .max_lifetime(Duration::from_secs(8))
    .sqlx_logging(sqlxlog) // Disable SQLx log
    .sqlx_logging_level(log::LevelFilter::Info);
  let conn = Database::connect(opt).await.expect("데이터베이스 연결실패");

  log::info!("SQLX 로깅 : {sqlxlog}");

  // ndms 데몬 초기화.
  ndms::ndms_app::init(conn.clone()).await;
  rtsp::main(conn.clone()).await;

  let sms_sender_phone = env::var("SMS_SENDER_PHONE").unwrap_or("01094757661".to_owned());
  let sms_enable = util::get_env_bool("SMS_ENABLE", false);

  log::info!("SMS 활성화 : {sms_enable}");
  log::info!("SMS 발신자 번호 : {sms_sender_phone}");

  syslog::app::init(conn.clone()).await; // 로그 데몬 초기화.

  let (tx_gate, rx_gate) = tokio::sync::mpsc::channel::<Box<dyn gate_app::IfGateCmd>>(50);
  let (tx_ws, rx_ws) = broadcast::channel::<Box<String>>(16);
  ws::wssender::init(tx_ws.clone()).await;
  rtsp::stat_mgr::init(conn.clone(), tx_ws.clone()).await;
  emcall_app::app::init(conn.clone(), tx_ws.clone()).await; // 비상통화 장치 데몬 초기화.
  ebrd_app::app::init(conn.clone(), tx_ws.clone()).await; // 전광판 데몬 초기화.
  let gate_ctx = GateCtx {
    conn: conn.clone(),
    tx_ws: tx_ws.clone(),
  };

  gate_app::tx_gate::init(tx_gate.clone()).await;
  tokio::spawn(gate_app::gate_main(gate_ctx, rx_gate));

  // 주기적으로 모든 게이트에 대해 상태를 확인하고, 상태를 업데이트한다.

  let enable_water_check = util::get_env_bool("ENABLE_WATER_STATUS_CHECK", false);
  if enable_water_check {
    water::recv_worker::start_worker(conn.clone()); // 수위계 상태체크와 동일설정으로 시작하도록.
    tokio::spawn(water::stat_worker::stat_worker(conn.clone(), tx_ws.clone()));
  }

  log::info!("수위계 상태 확인 활성화 : {enable_water_check}");

  // broad cast

  tokio::spawn(ws::monitor(rx_ws));
  if false {
    // 테스트 코드 스킵.
    tokio::spawn(ws::testtx(tx_ws.clone()));
  }

  //let templates = Tera::new(concat!(env!("CARGO_MANIFEST_DIR"), "/templates/**/*")).unwrap();
  //let ws_state = WsState { tx: tx_ws.clone() };
  let state = AppState {
    //templates,
    conn,
    tx_gate,
    tx_ws,
  };
  let addr = format!("0.0.0.0:{}", port);

  //info!("start bns-ldms-web {}", port);

  let mut server = HttpServer::new(move || {
    // build TLS config from files

    //log::info!("starting HTTPS server at http://localhost:8443");

    let mut app = App::new();
    app = app.service(web::scope("/_next").service(Files::new("/", "../bnsweb/out/_next").use_last_modified(true)));
    //app = app.service(web::resource("/{filename:^(?!api|ws).*$}").route(web::get().to(custom_file_handler)));

    // app = app.service(
    //   web::resource("/{filename:.*}")
    //     .guard(guard::Not(guard::fn_guard(is_api_or_ws)))
    //     .route(web::get().to(custom_file_handler)),
    // );

    app
      //.service(api::tests::test1)
      //.service(Fs::new("/static", "./static"))
      //.keep_alive()
      .app_data(
        MultipartFormConfig::default()
          .total_limit(50 * 1024 * 1024)
          .memory_limit(30 * 1024 * 1024),
      )
      .app_data(web::JsonConfig::default().limit(50 * 1024 * 1024)) // 1MB 제한
      .app_data(web::PayloadConfig::default().limit(50 * 1024 * 1024)) // 1MB 제한
      .app_data(web::FormConfig::default().limit(50 * 1024 * 1024))
      .app_data(web::Data::new(state.clone()))
      //.app_data(web::Data::new(ws_state.clone()))
      .wrap(mw::AuthService)
      //.service(index::index)
      .wrap(get_logger())
      .wrap(
        SessionMiddleware::builder(CookieSessionStore::default(), Key::from(&[0; 64]))
          .cookie_secure(false)
          // customize session and cookie expiration
          .session_lifecycle(PersistentSession::default().session_ttl(cookie::time::Duration::minutes(30)))
          .build(),
      )
      .configure(api::routes::register)
      .service(
        web::scope("/ws")
          //.app_data(web::Data::new(ws_state.clone()))
          .configure(ws::routes::register), //.route("/testecho", web::get().to(ws::testecho::echo)),
      )
      //.route("/ws/testecho", web::get().to(ws::testecho::echo))
      // .service(hello)
      // .service(test::hello)
      .service(web::resource("/{path:.*}").route(web::get().to(custom_file_handler)))
      // .service(
      //   Fs::new("/", "../bnsweb/out")
      //     //.show_files_listing()
      //     //.default_handler(index::p404)
      //     //.default_handler(f)
      //     .index_file("index.html"),
      // )
      .default_service(web::to(index::default_handler))
  })
  //.client_request_timeout(Duration::from_secs(60))
  .keep_alive(Duration::from_secs(75));

  if enable_https {
    // let mut builder = SslAcceptor::mozilla_intermediate(SslMethod::tls()).unwrap();
    // builder.set_private_key(&load_encrypted_private_key()).unwrap();
    // builder.set_certificate_chain_file("cert.pem").unwrap();
    // server = server.bind_openssl(addr, builder)?;
    server = server.bind(addr)?;
  } else {
    server = server.bind(addr)?;
  }

  // //.shutdown_timeout(60)
  // server.bind_openssl(addr, builder)?.run().await
  server.run().await
}

#[actix_web::main]
async fn mainstart() {
  color_eyre::install().unwrap();
  //dotenv().ok();

  let env_path = PathBuf::from(env::var("BNS_DOTENV").unwrap_or("_env".to_owned()));
  let env_file = if env_path.is_file() {
    println!("env_path: {}", env_path.display());
    dotenv::from_path(env_path.clone()).ok();
    env_path.display().to_string()
  } else {
    println!("env_path not found: {}. using default .env", env_path.display());
    dotenv::dotenv().ok();
    ".env".to_owned()
  };

  log4rs::init_file(env::var("LOG4RS_FILE").unwrap_or("log4rs.yml".to_owned()), Default::default()).unwrap();

  log::info!("LDMS 서버 시작");
  print_env_file(&env_file);

  let enable_https = util::get_env_bool("ENABLE_HTTPS", false);
  log::info!("HTTPS 활성화 : {enable_https}");

  let result = start(enable_https).await;
  if let Some(err) = result.err() {
    log::error!("Error : {err}");
  }

  log::info!("LDMS 서버 종료");

  //join(result, rtsp).await;

  ()
}

fn main() {
  //debug!("mainstart");
  mainstart();
  //debug!("mainend");
}

// fn load_encrypted_private_key() -> PKey<Private> {
//   let mut file = File::open("key.pem").unwrap();
//   let mut buffer = Vec::new();
//   file.read_to_end(&mut buffer).expect("Failed to read file");

//   PKey::private_key_from_pem_passphrase(&buffer, b"bnstech").unwrap()
// }
