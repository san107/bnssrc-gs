use std::env;
use std::fs;
use std::io::Write;
use std::path::Path;

use crate::{entities::tb_login, svc};
use actix_session::Session;
use actix_web::{get, post, web, HttpRequest, HttpResponse, Responder};
use log::info;
use sea_orm::*;
use serde::{Deserialize, Serialize};
use svc::conf::svc_config::mtn::Mtn;

pub fn regist_route(config: &mut web::ServiceConfig) {
  config
    .service(save)
    .service(one)
    .service(svr)
    .service(setenv)
    .service(getenv)
    // end of routes
    ;
}

#[derive(Serialize, Deserialize)]
struct SvrInfo {
  build_time: String,
  sms_enable: bool,
}
#[get("/api/config/svr")]
pub async fn svr(_sess: Session, _app: web::Data<crate::AppState>, _req: HttpRequest) -> impl Responder {
  //let build_time = env::var("VERGEN_BUILD_TIMESTAMP").unwrap_or_default();
  let build_time = option_env!("VERGEN_BUILD_TIMESTAMP").unwrap_or_default().to_string();

  HttpResponse::Ok().json(SvrInfo {
    build_time,
    sms_enable: env::var("SMS_ENABLE").unwrap_or_default() == "true",
  })
}

#[get("/api/config/one")]
pub async fn one(sess: Session, app: web::Data<crate::AppState>, _req: HttpRequest) -> impl Responder {
  let user = sess.get::<tb_login::Model>("login").unwrap().unwrap();
  //HttpResponse::Ok().json(user)

  let ret = svc::conf::svc_config::qry::Qry::find_by_id(&app.conn, &user.grp_id).await;
  let obj = match ret {
    Ok(l) => l,
    _ => None,
  };
  HttpResponse::Ok().json(obj)
}

#[post("/api/config/save")]
pub async fn save(sess: Session, app: web::Data<crate::AppState>, info: web::Json<serde_json::Value>) -> impl Responder {
  info!("config info {:?}", info);

  let login = sess.get::<tb_login::Model>("login").unwrap().unwrap();
  info!("login {:?}", login);

  let ret = Mtn::save_config(&app.conn, info.clone(), login.grp_id).await;

  match ret {
    Ok(obj) => HttpResponse::Ok().json(obj.try_into_model().unwrap()),
    Err(e) => HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", e)),
  }
}

#[derive(Serialize, Deserialize)]
struct EnvUpdate {
  key: String,
  value: String,
}

#[post("/api/config/setenv")]
pub async fn setenv(sess: Session, _app: web::Data<crate::AppState>, info: web::Json<EnvUpdate>) -> impl Responder {
  let user = match sess.get::<tb_login::Model>("login") {
    Ok(Some(_)) => true,
    _ => false,
  };
  if !user {
    return HttpResponse::Unauthorized().body("Unauthorized");
  }

  // 환경 변수 업데이트
  env::set_var(&info.key, &info.value);

  // .env 파일 업데이트
  let env_path = Path::new(".env");
  if env_path.exists() {
    let content = fs::read_to_string(env_path).unwrap_or_default();
    let mut lines: Vec<String> = content.lines().map(String::from).collect();

    let key_line = format!("{}={}", info.key, info.value);
    let mut found = false;

    for line in lines.iter_mut() {
      if line.starts_with(&format!("{}=", info.key)) {
        *line = key_line.clone();
        found = true;
        break;
      }
    }

    if !found {
      lines.push(key_line);
    }

    if let Ok(mut file) = fs::File::create(env_path) {
      if let Err(e) = writeln!(file, "{}", lines.join("\n")) {
        return HttpResponse::InternalServerError().body(format!("Failed to write to .env file: {}", e));
      }
    } else {
      return HttpResponse::InternalServerError().body("Failed to open .env file for writing");
    }
  }

  HttpResponse::Ok().json(serde_json::json!({
    "status": "success",
    "key": info.key,
    "value": info.value
  }))
}

#[derive(Serialize, Deserialize)]
struct EnvValue {
  value: String,
}

#[get("/api/config/getenv/{key}")]
pub async fn getenv(sess: Session, _app: web::Data<crate::AppState>, key: web::Path<String>) -> impl Responder {
  let user = match sess.get::<tb_login::Model>("login") {
    Ok(Some(_)) => true,
    _ => false,
  };
  if !user {
    return HttpResponse::Unauthorized().body("Unauthorized");
  }

  let value = env::var(&*key).unwrap_or_default();

  HttpResponse::Ok().json(EnvValue { value })
}
