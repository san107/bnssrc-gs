use crate::{entities::tb_login, models::WebCmd, svc};
use actix_session::Session;
use actix_web::{get, post, web, HttpRequest, HttpResponse, Responder};
use log::info;
use qstring::QString;
use sea_orm::TryIntoModel;
use svc::comm::svc_book_mark::mtn::Mtn;

pub fn regist_route(config: &mut web::ServiceConfig) {
  config
    // book_mark
    .service(list)
    .service(one)
    .service(save)
    .service(delete)
    // end of regist
    ;
}

#[get("/api/book_mark/one")]
pub async fn one(_sess: Session, app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  //let user = sess.get::<tb_login::Model>("login").unwrap();
  //HttpResponse::Ok().json(user)

  let qs = QString::from(req.query_string());
  let seq = qs.get("bmSeq").unwrap().parse::<i32>().unwrap();

  let ret = svc::comm::svc_book_mark::qry::Qry::find_by_id(&app.conn, seq).await;
  let obj = match ret {
    Ok(l) => l,
    _ => None,
  };
  HttpResponse::Ok().json(obj)
}

#[get("/api/book_mark/list")]
pub async fn list(_sess: Session, app: web::Data<crate::AppState>) -> impl Responder {
  //let user = sess.get::<tb_login::Model>("login").unwrap();
  //HttpResponse::Ok().json(user)
  let rlt = svc::comm::svc_book_mark::qry::Qry::find_all(&app.conn).await;
  let l = match rlt {
    Ok(l) => l,
    _ => vec![],
  };
  HttpResponse::Ok().json(l)
}

#[post("/api/book_mark/save")]
pub async fn save(_sess: Session, app: web::Data<crate::AppState>, info: web::Json<serde_json::Value>) -> impl Responder {
  info!("book_mark info {:?}", info);

  let mut data = info.clone();

  if let Ok(Some(login)) = _sess.get::<tb_login::Model>("login") {
    data["grp_id"] = serde_json::Value::String(login.grp_id.clone());
  }

  let ret = Mtn::save_book_mark(&app.conn, data).await;

  match ret {
    Ok(obj) => HttpResponse::Ok().json(obj.try_into_model().unwrap()),
    Err(e) => HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", e)),
  }
}

#[post("/api/book_mark/delete")]
pub async fn delete(app: web::Data<crate::AppState>, info: web::Json<serde_json::Value>) -> impl Responder {
  info!("book_mark info {:?}", info);

  let bm_seq = info.get("bm_seq").unwrap().as_i64().unwrap() as i32;

  let ret = Mtn::delete_book_mark(&app.conn, bm_seq).await;

  match ret {
    Ok(obj) => HttpResponse::Ok().json(crate::models::WebRes {
      rslt: WebCmd::Ok,
      msg: format!("{:?}", obj),
    }),
    Err(e) => HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", e)),
  }
}
