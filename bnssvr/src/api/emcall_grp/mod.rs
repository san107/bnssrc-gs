use actix_session::Session;
use actix_web::{get, post, web, HttpRequest, HttpResponse, Responder};
use qstring::QString;
use sea_orm::TryIntoModel;
use tokio::sync::oneshot;

use crate::emcall_app;
use crate::emcall_app::model::{ItgStat, ItgStatSend, ItgStatWrap};
use crate::{entities::tb_login, models::WebCmd, svc::emcall::svc_emcall_grp};
pub fn regist_route(config: &mut web::ServiceConfig) {
  config
    .service(get_emcall_list)
    .service(save_emcall)
    .service(delete_emcall)
    .service(update_disp_seqs)
    .service(one)
    .service(get_stat)
    .service(send_stat)
    // end of routes
    ;
}

#[get("/api/emcall_grp/get_stat")]
pub async fn get_stat(app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  let qs = QString::from(req.query_string());
  //let seq = qs.get("emcall_grp_seq").unwrap().parse::<i32>().unwrap();
  let seq = qs.get("emcall_grp_seq");
  let devid = qs.get("device_id");

  let ret = if seq.is_some() {
    let seq = seq.unwrap().parse::<i32>().unwrap();
    svc_emcall_grp::qry::Qry::find_by_id(&app.conn, seq).await
  } else if devid.is_some() {
    let devid = devid.unwrap();
    svc_emcall_grp::qry::Qry::find_by_device_id(&app.conn, &devid).await
  } else {
    return HttpResponse::BadRequest().body("BadRequest");
  };

  let obj = match ret {
    Ok(obj) => obj,
    Err(e) => return HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", e)),
  };
  if obj.is_none() {
    return HttpResponse::NotFound().body("Not Found");
  }
  let obj = obj.unwrap();
  let url = emcall_app::get_emcall_grp_stat_url(&obj);
  let stat = emcall_app::get_emcall_grp_stat(url).await;
  match stat {
    Ok(stat) => HttpResponse::Ok().json(stat),
    Err(e) => HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", e)),
  }
}

#[post("/api/emcall_grp/send_stat")]
pub async fn send_stat(app: web::Data<crate::AppState>, sess: Session, data: web::Json<serde_json::Value>) -> impl Responder {
  let login = sess.get::<tb_login::Model>("login").unwrap().unwrap();
  log::info!("send_stat: {:?}", data);
  let stat: ItgStat = match serde_json::from_value(data.into_inner()) {
    Ok(stat) => stat,
    Err(e) => return HttpResponse::BadRequest().body(format!("BadRequest {:?}", e)),
  };
  let ret = svc_emcall_grp::qry::Qry::find_by_device_id(&app.conn, &stat.device_id).await;
  if ret.is_err() {
    return HttpResponse::NotFound().body("Not Found");
  }
  let obj = ret.unwrap();
  if obj.is_none() {
    return HttpResponse::NotFound().body("Not Found");
  }
  let obj = obj.unwrap();

  let seq = obj.emcall_grp_seq;

  let stat_wrap = ItgStatWrap {
    emcall_grp_seq: seq,
    user_id: login.user_id,
    stat: stat,
  };

  let (tx, rx) = oneshot::channel::<Result<(), String>>();
  let stat_send = ItgStatSend {
    wrap: stat_wrap,
    tx: Some(tx),
  };

  emcall_app::app::emcall_send(Box::new(stat_send)).await;

  let res = rx.await;
  let res = match res {
    Ok(ok) => ok,
    Err(e) => return HttpResponse::InternalServerError().body(format!("InternalServerError(channel) {:?}", e)),
  };

  match res {
    Ok(_) => HttpResponse::Ok().body("ok"),
    Err(e) => HttpResponse::InternalServerError().body(format!("InternalServerError(do) {:?}", e)),
  }
}

#[get("/api/emcall_grp/one")]
pub async fn one(app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  let qs = QString::from(req.query_string());
  let seq = qs.get("emcallGrpSeq").unwrap().parse::<i32>().unwrap();

  let ret = svc_emcall_grp::qry::Qry::find_by_id(&app.conn, seq).await;
  let obj = match ret {
    Ok(l) => l,
    _ => None,
  };
  HttpResponse::Ok().json(obj)
}

#[get("/api/emcall_grp/list")]
pub async fn get_emcall_list(sess: Session, app: web::Data<crate::AppState>) -> impl Responder {
  let login = sess.get::<tb_login::Model>("login").unwrap().unwrap();

  let ret = svc_emcall_grp::qry::Qry::find_all(&app.conn, &login.grp_id).await;
  let obj = match ret {
    Ok(obj) => obj,
    Err(e) => {
      return HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", e));
    }
  };

  HttpResponse::Ok().json(obj)
}

#[post("/api/emcall_grp/save")]
pub async fn save_emcall(app: web::Data<crate::AppState>, data: web::Json<serde_json::Value>) -> impl Responder {
  let ret = svc_emcall_grp::mtn::Mtn::save_emcall(&app.conn, data.into_inner()).await;
  match ret {
    Ok(obj) => HttpResponse::Ok().json(obj.try_into_model().unwrap()),
    Err(e) => HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", e)),
  }
}

#[post("/api/emcall_grp/delete")]
pub async fn delete_emcall(app: web::Data<crate::AppState>, data: web::Json<serde_json::Value>) -> impl Responder {
  let emcall_grp_seq = data.get("emcall_grp_seq").unwrap().as_i64().unwrap() as i32;
  let ret = svc_emcall_grp::mtn::Mtn::delete_emcall(&app.conn, emcall_grp_seq).await;
  match ret {
    Ok(obj) => HttpResponse::Ok().json(crate::models::WebRes {
      rslt: WebCmd::Ok,
      msg: format!("{:?}", obj),
    }),
    Err(e) => HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", e)),
  }
}

#[post("/api/emcall_grp/update_disp_seqs")]
pub async fn update_disp_seqs(app: web::Data<crate::AppState>, data: web::Json<serde_json::Value>) -> impl Responder {
  let ret = svc_emcall_grp::mtn::Mtn::update_disp_seqs(&app.conn, data.into_inner()).await;
  let obj = match ret {
    Ok(obj) => obj,
    Err(e) => return HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", e)),
  };

  HttpResponse::Ok().json(obj)
}
