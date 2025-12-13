use actix_session::Session;
use actix_web::{get, post, web, HttpRequest, HttpResponse, Responder};
use qstring::QString;
use sea_orm::TryIntoModel;

use crate::{
  entities::tb_login,
  models::{WebCmd, WebRes},
  svc::ebrd::svc_ebrd,
};

mod ebrd_ctrl;
mod ebrd_ctrl_oper_night_time;
mod ebrd_ctrl_room_info;

pub fn regist_route(config: &mut web::ServiceConfig) {
  config
    .service(get_ebrd_list)
    .service(save_ebrd)
    .service(delete_ebrd)
    .service(update_disp_seqs)
    .service(one)
    .service(update_emer_msg_pos)
    // end of routes
    ;

  ebrd_ctrl::regist_route(config);
  ebrd_ctrl_oper_night_time::regist_route(config);
  ebrd_ctrl_room_info::regist_route(config);
}

#[get("/api/ebrd/one")]
pub async fn one(sess: Session, app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  let login = sess.get::<tb_login::Model>("login").unwrap().unwrap();
  let qs = QString::from(req.query_string());
  let seq = qs.get("ebrdSeq").unwrap().parse::<i32>().unwrap();

  let ret = svc_ebrd::qry::Qry::find_by_id(&app.conn, seq, &login.grp_id).await;
  let obj = match ret {
    Ok(l) => l,
    _ => None,
  };
  HttpResponse::Ok().json(obj)
}

#[get("/api/ebrd/list")]
pub async fn get_ebrd_list(sess: Session, app: web::Data<crate::AppState>, _req: HttpRequest) -> impl Responder {
  let login = sess.get::<tb_login::Model>("login").unwrap().unwrap();

  let ret = svc_ebrd::qry::Qry::find_all(&app.conn, &login.grp_id).await;
  let obj = match ret {
    Ok(l) => l,
    _ => vec![],
  };
  HttpResponse::Ok().json(obj)
}

#[post("/api/ebrd/save")]
pub async fn save_ebrd(app: web::Data<crate::AppState>, data: web::Json<serde_json::Value>) -> impl Responder {
  let ret = svc_ebrd::mtn::Mtn::save_ebrd(&app.conn, data.into_inner()).await;

  match ret {
    Ok(obj) => HttpResponse::Ok().json(obj.try_into_model().unwrap()),
    Err(e) => HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", e)),
  }
}

#[post("/api/ebrd/delete")]
pub async fn delete_ebrd(app: web::Data<crate::AppState>, data: web::Json<serde_json::Value>) -> impl Responder {
  let ebrd_seq = data.get("ebrd_seq").unwrap().as_i64().unwrap() as i32;
  let ret = svc_ebrd::mtn::Mtn::delete_ebrd(&app.conn, ebrd_seq).await;
  match ret {
    Ok(obj) => HttpResponse::Ok().json(crate::models::WebRes {
      rslt: WebCmd::Ok,
      msg: format!("{:?}", obj),
    }),
    Err(e) => HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", e)),
  }
}

#[post("/api/ebrd/update_disp_seqs")]
pub async fn update_disp_seqs(app: web::Data<crate::AppState>, data: web::Json<serde_json::Value>) -> impl Responder {
  let ret = svc_ebrd::mtn::Mtn::update_disp_seqs(&app.conn, data.into_inner()).await;

  match ret {
    Ok(_) => HttpResponse::Ok().json(WebRes {
      rslt: WebCmd::Ok,
      msg: format!("update ok"),
    }),
    Err(e) => HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", e)),
  }
}

#[post("/api/ebrd/update_emer_msg_pos")]
pub async fn update_emer_msg_pos(app: web::Data<crate::AppState>, data: web::Json<serde_json::Value>) -> impl Responder {
  let ebrd_seq = data.get("ebrd_seq").unwrap().as_i64().unwrap() as i32;
  let ebrd_emer_msg_pos = data.get("ebrd_emer_msg_pos").and_then(|v| v.as_i64()).map(|v| v as i32);

  log::info!("ebrd_seq: {}, ebrd_emer_msg_pos: {:?}", ebrd_seq, ebrd_emer_msg_pos);

  let ret = svc_ebrd::mtn::Mtn::update_emer_msg_pos(&app.conn, ebrd_seq, ebrd_emer_msg_pos).await;

  match ret {
    Ok(_) => HttpResponse::Ok().json(WebRes {
      rslt: WebCmd::Ok,
      msg: format!("update ok"),
    }),
    Err(e) => HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", e)),
  }
}
