use crate::svc::ndms::svc_cou_dngr_almord::{self, mtn::Mtn};
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

#[get("/api/cou_dngr_almord/one")]
pub async fn one(_sess: Session, app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  let qs = QString::from(req.query_string());
  let dscode = qs.get("dscode").unwrap().to_owned();
  let cd_dist_obsv = qs.get("cd_dist_obsv").unwrap().parse().unwrap();
  let almcode = qs.get("almcode").unwrap().to_owned();
  let almde = qs.get("almde").unwrap().to_owned();
  let almgb = qs.get("almgb").unwrap().to_owned();

  let ret = svc_cou_dngr_almord::qry::Qry::find_by_id(&app.conn, (dscode, cd_dist_obsv, almcode, almde, almgb)).await;
  let obj = match ret {
    Ok(l) => l,
    _ => None,
  };
  HttpResponse::Ok().json(obj)
}

#[get("/api/cou_dngr_almord/list")]
pub async fn list(_sess: Session, app: web::Data<crate::AppState>) -> impl Responder {
  //let user = sess.get::<tb_login::Model>("login").unwrap();
  //HttpResponse::Ok().json(user)
  let rlt = svc_cou_dngr_almord::qry::Qry::find_all(&app.conn).await;
  let l = match rlt {
    Ok(l) => l,
    _ => vec![],
  };
  HttpResponse::Ok().json(l)
}

#[post("/api/cou_dngr_almord/save")]
pub async fn save(app: web::Data<crate::AppState>, info: web::Json<serde_json::Value>) -> impl Responder {
  info!("info {:?}", info);

  let ret = Mtn::save(&app.conn, info.clone()).await;

  match ret {
    Ok(obj) => HttpResponse::Ok().json(obj.try_into_model().unwrap()),
    Err(e) => HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", e)),
  }
}

#[post("/api/cou_dngr_almord/delete")]
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
