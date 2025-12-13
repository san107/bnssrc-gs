use crate::{entities::tb_login, models::WebCmd, svc};
use actix_session::Session;
use actix_web::{get, post, web, HttpRequest, HttpResponse, Responder};
use log::info;
use qstring::QString;
use sea_orm::TryIntoModel;
use svc::comm::svc_group::mtn::Mtn;

pub fn regist_route(config: &mut web::ServiceConfig) {
  config
    .service(list)
    .service(groupingate)
    .service(save)
    .service(savewithel)
    .service(one)
    .service(delete);
}

#[get("/api/group/one")]
pub async fn one(_sess: Session, app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  //let user = sess.get::<tb_login::Model>("login").unwrap();
  //HttpResponse::Ok().json(user)

  let qs = QString::from(req.query_string());
  let seq = qs.get("grpSeq").unwrap().parse::<i32>().unwrap();

  let ret = svc::comm::svc_group::qry::Qry::find_by_id(&app.conn, seq).await;
  let obj = match ret {
    Ok(l) => l,
    _ => None,
  };
  HttpResponse::Ok().json(obj)
}

// #[get("/api/group/list")]
// pub async fn list(_sess: Session, app: web::Data<crate::AppState>) -> impl Responder {
//   //let user = sess.get::<tb_login::Model>("login").unwrap();
//   //HttpResponse::Ok().json(user)
//   let rlt = svc::svc_group::qry::Qry::find_all(&app.conn).await;
//   let l = match rlt {
//     Ok(l) => l,
//     _ => vec![],
//   };
//   HttpResponse::Ok().json(l)
// }

#[get("/api/group/list")]
pub async fn list(_sess: Session, app: web::Data<crate::AppState>) -> impl Responder {
  let login = _sess.get::<tb_login::Model>("login").unwrap().unwrap();

  let rlt = svc::comm::svc_group::qry::Qry::find_all(&app.conn, &login.grp_id).await;
  let l = match rlt {
    Ok(l) => l,
    _ => vec![],
  };
  HttpResponse::Ok().json(l)
}

#[get("/api/group/groupingate")]
pub async fn groupingate(_sess: Session, app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  let login = _sess.get::<tb_login::Model>("login").unwrap().unwrap();
  let qs = QString::from(req.query_string());
  let seq = qs.get("seq").unwrap().parse::<i32>().unwrap();

  let rlt = svc::comm::svc_group::qry::Qry::find_by_groupingate(&app.conn, seq, &login.grp_id).await;
  let l = match rlt {
    Ok(l) => l,
    _ => vec![],
  };

  HttpResponse::Ok().json(l)
}

#[post("/api/group/save")]
pub async fn save(app: web::Data<crate::AppState>, info: web::Json<serde_json::Value>) -> impl Responder {
  info!("group info {:?}", info);

  let ret = Mtn::save_group(&app.conn, info.clone()).await;

  match ret {
    Ok(obj) => HttpResponse::Ok().json(obj.try_into_model().unwrap()),
    Err(e) => HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", e)),
  }
}

#[post("/api/group/delete")]
pub async fn delete(app: web::Data<crate::AppState>, info: web::Json<serde_json::Value>) -> impl Responder {
  // info!("group info {:?}", info);

  let grp_seq = info.get("grp_seq").unwrap().as_i64().unwrap() as i32;

  let ret = Mtn::delete_group(&app.conn, grp_seq).await;

  match ret {
    Ok(obj) => HttpResponse::Ok().json(crate::models::WebRes {
      rslt: WebCmd::Ok,
      msg: format!("{:?}", obj),
    }),
    Err(e) => HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", e)),
  }
}

#[post("/api/group/savewithel")]
pub async fn savewithel(app: web::Data<crate::AppState>, info: web::Json<serde_json::Value>) -> impl Responder {
  info!("group_el info {:?}", info);

  let ret = Mtn::save_group_and_el(&app.conn, info.clone()).await;

  match ret {
    Ok(obj) => HttpResponse::Ok().json(crate::models::WebRes {
      rslt: WebCmd::Ok,
      msg: format!("{:?}", obj),
    }),
    Err(e) => HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", e)),
  }
}
