use actix_files::Files as Fs;
use actix_session::{config::PersistentSession, storage::CookieSessionStore, SessionMiddleware};
use actix_web::{
  cookie::{self, Key},
  middleware, web, App, HttpServer,
};
use dotenv::dotenv;
use log::{error, info};
use std::env;
use std::time::Duration;

mod index;

//#[actix_web::main]
async fn start() -> std::io::Result<()> {
  let port = env::var("MAP_PORT")
    .unwrap_or("3013".to_owned())
    .parse::<u16>()
    .unwrap_or(3013);
  // for (key, value) in env::vars() {
  //     println!("{}: {}", key, value);
  // }

  let tiles_root = env::var("TILES_ROOT").unwrap();

  info!("start bns-ldms-web {}", port);
  HttpServer::new(move || {
    App::new()
      //.service(api::tests::test1)
      //.service(Fs::new("/static", "./static"))
      //.keep_alive()
      //.service(index::index)
      .wrap(middleware::Logger::new(
        //r#"%a "%r" %s %b "%{Referer}i" "%{User-Agent}i" %T"#,
        //r#"%{r}a "%r" %s %b "%{Referer}i" "%{User-Agent}i" %T"#,
        r#"===== %{r}a "%r" %s %b %T ====="#,
      ))
      .wrap(
        SessionMiddleware::builder(CookieSessionStore::default(), Key::from(&[0; 64]))
          .cookie_secure(false)
          // customize session and cookie expiration
          .session_lifecycle(PersistentSession::default().session_ttl(cookie::time::Duration::hours(2)))
          .build(),
      )
      //.route("/ws/testecho", web::get().to(ws::testecho::echo))
      // .service(hello)
      // .service(test::hello)
      .service(
        Fs::new("/", &tiles_root)
          //.show_files_listing()
          //.default_handler(index::p404)
          //.default_handler(f)
          .index_file("index.html"),
      )
      .default_service(web::to(index::default_handler))
  })
  //.client_request_timeout(Duration::from_secs(60))
  .keep_alive(Duration::from_secs(75))
  //.shutdown_timeout(60)
  .bind(("0.0.0.0", port))?
  .run()
  .await
}

#[actix_web::main]
async fn mainstart() {
  color_eyre::install().unwrap();
  let envfile = "conf/.bnsmap.env";
  dotenv::from_filename(envfile).ok();
  dotenv().ok();

  log4rs::init_file(
    env::var("LOG4RS_FILE").unwrap_or("conf/bnsmap-log4rs.yml".to_owned()),
    Default::default(),
  )
  .unwrap();

  log::info!("bnsmap server start");

  let result = start().await;
  if let Some(err) = result.err() {
    error!("Error : {err}");
  }

  log::info!("bnsmap server end");

  ()
}

fn main() {
  mainstart();
}
