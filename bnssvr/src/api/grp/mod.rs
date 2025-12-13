use crate::{
  entities::tb_login,
  models::{WebCmd, WebRes},
  svc,
};
use actix_session::Session;
use actix_web::{get, post, web, HttpRequest, HttpResponse, Responder};
use log::info;
use qstring::QString;
use sea_orm::TryIntoModel;
// use serde_json::json;
use svc::user::svc_grp::mtn::Mtn;

pub fn regist_route(config: &mut web::ServiceConfig) {
  config
    // grp
    .service(list)
    .service(one)
    .service(childlist)
    .service(save)
    .service(delete)
    // end of regist
    ;
}

#[get("/api/grp/one")]
pub async fn one(_sess: Session, app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  //let user = sess.get::<tb_login::Model>("login").unwrap();
  //HttpResponse::Ok().json(user)

  let qs: QString = QString::from(req.query_string());
  let id: String = qs.get("grpId").unwrap().into();

  let ret = svc::user::svc_grp::qry::Qry::find_by_id(&app.conn, &id).await;
  let obj = match ret {
    Ok(l) => l,
    _ => None,
  };
  HttpResponse::Ok().json(obj)
}

#[get("/api/grp/list")]
pub async fn list(_sess: Session, app: web::Data<crate::AppState>) -> impl Responder {
  //let user = sess.get::<tb_login::Model>("login").unwrap();
  //HttpResponse::Ok().json(user)
  let rlt = svc::user::svc_grp::qry::Qry::find_all(&app.conn).await;
  let l = match rlt {
    Ok(l) => l,
    _ => vec![],
  };
  HttpResponse::Ok().json(l)
}

#[get("/api/grp/childlist")]
pub async fn childlist(sess: Session, app: web::Data<crate::AppState>) -> impl Responder {
  let user = sess.get::<tb_login::Model>("login").unwrap().unwrap();
  //HttpResponse::Ok().json(user)
  //let qs = QString::from(req.query_string());
  let id: String = user.grp_id.clone();

  let rlt = svc::user::svc_grp::qry::Qry::find_by_childlist(&app.conn, &id).await;
  let l = match rlt {
    Ok(l) => l,
    _ => vec![],
  };

  HttpResponse::Ok().json(l)
}

#[post("/api/grp/save")]
pub async fn save(sess: Session, app: web::Data<crate::AppState>, info: web::Json<serde_json::Value>) -> impl Responder {
  let user = sess.get::<tb_login::Model>("login").unwrap().unwrap();
  info!("grp info {:?}", info);

  let ret = Mtn::save_grp(&app.conn, info.clone(), user.grp_id.clone()).await;
  // info!("ret {:?}", ret);

  match ret {
    Ok(obj) => HttpResponse::Ok().json(obj.try_into_model().unwrap()),
    Err(e) => HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", e)),
  }
}

#[post("/api/grp/delete")]
pub async fn delete(app: web::Data<crate::AppState>, info: web::Json<serde_json::Value>) -> impl Responder {
  let id = info.get("grp_id").unwrap().as_str().unwrap();

  let ret = Mtn::delete_grp(&app.conn, &id).await;

  match ret {
    Ok(obj) => HttpResponse::Ok().json(WebRes {
      rslt: WebCmd::Ok,
      msg: format!("{:?}", obj),
    }),
    Err(e) => HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", e)),
  }
}
