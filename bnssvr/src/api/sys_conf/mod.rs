use crate::{entities::tb_login, svc::conf::svc_sys_conf};
use actix_session::Session;
use actix_web::{get, post, web, HttpRequest, HttpResponse, Responder};
use sea_orm::TryIntoModel;

pub fn regist_route(config: &mut web::ServiceConfig) {
  config
    .service(get_sys_conf)
    .service(save)
    // end of routes 
    ;
}

#[get("/api/public/sys_conf/get")]
pub async fn get_sys_conf(app: web::Data<crate::AppState>, _req: HttpRequest) -> impl Responder {
  let ret = svc_sys_conf::qry::Qry::get_sys_conf(&app.conn).await;
  let obj = match ret {
    Ok(l) => l,
    _ => None,
  };
  HttpResponse::Ok().json(obj)
}

#[post("/api/sys_conf/save")]
pub async fn save(sess: Session, app: web::Data<crate::AppState>, info: web::Json<serde_json::Value>) -> impl Responder {
  log::info!("sys_conf save info {:?}", info);

  let login = sess.get::<tb_login::Model>("login").unwrap().unwrap();
  log::info!("login {:?}", login);

  let ret = svc_sys_conf::mtn::Mtn::save(&app.conn, info.clone()).await;

  match ret {
    Ok(obj) => HttpResponse::Ok().json(obj.try_into_model().unwrap()),
    Err(e) => HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", e)),
  }
}
