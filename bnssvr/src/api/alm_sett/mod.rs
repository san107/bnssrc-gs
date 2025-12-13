use crate::{
  models::{WebCmd, WebRes},
  svc::alm::svc_alm_sett::{self, mtn::Mtn},
};
use actix_session::Session;
use actix_web::{get, post, web, HttpRequest, HttpResponse, Responder};
use log::info;
use qstring::QString;

pub fn regist(config: &mut web::ServiceConfig) {
  config
    // alm_sett
    .service(list)
    .service(saves)
    // end of regist
    ;
}

#[get("/api/alm_sett/list")]
pub async fn list(_sess: Session, app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  //let user = sess.get::<tb_login::Model>("login").unwrap();
  //HttpResponse::Ok().json(user)
  let qs = QString::from(req.query_string());
  let seq = qs.get("almUserSeq").unwrap().parse::<i32>().unwrap();

  let rlt = svc_alm_sett::qry::Qry::find_by_user(&app.conn, seq).await;
  let l = match rlt {
    Ok(l) => l,
    _ => vec![],
  };
  HttpResponse::Ok().json(l)
}

#[post("/api/alm_sett/saves")]
pub async fn saves(app: web::Data<crate::AppState>, info: web::Json<serde_json::Value>) -> impl Responder {
  info!("camera info {:?}", info);

  let ret = Mtn::saves(&app.conn, info.clone()).await;

  match ret {
    Ok(obj) => HttpResponse::Ok().json(WebRes {
      rslt: WebCmd::Ok,
      msg: format!("{obj:?}"),
    }),
    Err(e) => HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", e)),
  }
}
