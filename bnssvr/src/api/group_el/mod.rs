use crate::{models::WebCmd, svc};
use actix_session::Session;
use actix_web::{get, post, web, HttpRequest, HttpResponse, Responder};
use log::info;
use qstring::QString;
// use sea_orm::TryIntoModel;
// use serde_json::json;
use svc::comm::svc_group_el::mtn::Mtn;

pub fn regist(config: &mut web::ServiceConfig) {
  config
      // group_el
      .service(one)
      .service(list)
      .service(save)
      .service(delete)
      // end of regist
      ;
}

#[get("/api/group_el/one")]
pub async fn one(_sess: Session, app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  //let user = sess.get::<tb_login::Model>("login").unwrap();
  //HttpResponse::Ok().json(user)

  let qs = QString::from(req.query_string());
  let seq = qs.get("grpSeq").unwrap().parse::<i32>().unwrap();

  let ret = svc::comm::svc_group_el::qry::Qry::find_by_id(&app.conn, seq).await;
  let obj = match ret {
    Ok(l) => l,
    _ => None,
  };
  HttpResponse::Ok().json(obj)
}

#[get("/api/group_el/list")]
pub async fn list(_sess: Session, app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  //let user = sess.get::<tb_login::Model>("login").unwrap();
  //HttpResponse::Ok().json(user)
  let qs = QString::from(req.query_string());
  let seq = qs.get("grpSeq").unwrap().parse::<i32>().unwrap();

  let rlt = svc::comm::svc_group_el::qry::Qry::find_by_grpid(&app.conn, seq).await;
  let l = match rlt {
    Ok(l) => l,
    _ => vec![],
  };

  HttpResponse::Ok().json(l)
}

#[post("/api/group_el/save")]
pub async fn save(app: web::Data<crate::AppState>, info: web::Json<serde_json::Value>) -> impl Responder {
  info!("group_el info {:?}", info);

  let ret = Mtn::save_group_el(&app.conn, info.clone()).await;

  match ret {
    Ok(obj) => HttpResponse::Ok().json(crate::models::WebRes {
      rslt: WebCmd::Ok,
      msg: format!("{:?}", obj),
    }),
    Err(e) => HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", e)),
  }
}

#[post("/api/group_el/delete")]
pub async fn delete(app: web::Data<crate::AppState>, info: web::Json<serde_json::Value>) -> impl Responder {
  // info!("group info {:?}", info);

  let grp_seq = info.get("grp_seq").unwrap().as_i64().unwrap() as i32;

  let ret = Mtn::delete_group_el(&app.conn, grp_seq).await;

  match ret {
    Ok(obj) => HttpResponse::Ok().json(crate::models::WebRes {
      rslt: WebCmd::Ok,
      msg: format!("{:?}", obj),
    }),
    Err(e) => HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", e)),
  }
}
