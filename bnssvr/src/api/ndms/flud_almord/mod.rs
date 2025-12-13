use crate::svc::ndms::svc_flud_almord::{self, mtn::Mtn};
use actix_session::Session;
use actix_web::{get, post, web, HttpRequest, HttpResponse, Responder};
use log::info;
use qstring::QString;
use sea_orm::TryIntoModel;

pub fn regist_route(config: &mut web::ServiceConfig) {
  config.service(one)
  .service(list)
  .service(save)
  .service(delete)
  // end of routes 
  ;
}

#[get("/api/flud_almord/one")]
pub async fn one(_sess: Session, app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  let qs = QString::from(req.query_string());
  let flcode = qs.get("flcode").unwrap().to_owned();
  let cd_dist_intrcp = qs.get("cd_dist_intrcp").unwrap().parse().unwrap();
  let sttusde = qs.get("sttusde").unwrap().to_owned();
  let intrcp_sttus = qs.get("intrcp_sttus").unwrap().to_owned();

  let ret = svc_flud_almord::qry::Qry::find_by_id(&app.conn, (flcode, cd_dist_intrcp, sttusde, intrcp_sttus)).await;
  let obj = match ret {
    Ok(l) => l,
    _ => None,
  };
  HttpResponse::Ok().json(obj)
}

#[get("/api/flud_almord/list")]
pub async fn list(_sess: Session, app: web::Data<crate::AppState>) -> impl Responder {
  //let user = sess.get::<tb_login::Model>("login").unwrap();
  //HttpResponse::Ok().json(user)
  let rlt = svc_flud_almord::qry::Qry::find_all(&app.conn).await;
  let l = match rlt {
    Ok(l) => l,
    _ => vec![],
  };
  HttpResponse::Ok().json(l)
}

#[post("/api/flud_almord/save")]
pub async fn save(app: web::Data<crate::AppState>, info: web::Json<serde_json::Value>) -> impl Responder {
  info!("info {:?}", info);

  let ret = Mtn::save(&app.conn, info.clone()).await;

  match ret {
    Ok(obj) => HttpResponse::Ok().json(obj.try_into_model().unwrap()),
    Err(e) => HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", e)),
  }
}

#[post("/api/flud_almord/delete")]
pub async fn delete(app: web::Data<crate::AppState>, info: web::Json<serde_json::Value>) -> impl Responder {
  info!("info {:?}", info);

  let ret = Mtn::delete(&app.conn, info.clone()).await;

  match ret {
    Ok(obj) => HttpResponse::Ok().json(crate::models::WebRes {
      rslt: crate::models::WebCmd::Ok,
      msg: format!("{:?}", obj),
    }),
    Err(e) => HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", e)),
  }
}
