use crate::{entities::tb_login, models::WebCmd, svc::emcall::svc_emcall};
use actix_session::Session;
use actix_web::{get, post, web, HttpRequest, HttpResponse, Responder};
use qstring::QString;
use sea_orm::TryIntoModel;

pub fn regist_route(config: &mut web::ServiceConfig) {
  config
    .service(get_emcall_list)
    .service(save_emcall)
    .service(delete_emcall)
    .service(update_disp_seqs)
    .service(one)
    .service(one_by_id)
    // end of routes
    ;
}

#[get("/api/emcall/one")]
pub async fn one(app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  let qs = QString::from(req.query_string());
  let seq = qs.get("emcallSeq").unwrap().parse::<i32>().unwrap();

  let ret = svc_emcall::qry::Qry::find_by_id(&app.conn, seq).await;
  let obj = match ret {
    Ok(l) => l,
    _ => None,
  };
  HttpResponse::Ok().json(obj)
}

#[get("/api/emcall/one_by_id")]
pub async fn one_by_id(app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  let qs = QString::from(req.query_string());
  let emcall_id = qs.get("emcallId").unwrap();

  let ret = svc_emcall::qry::Qry::find_by_emcall_id(&app.conn, &emcall_id).await;
  let obj = match ret {
    Ok(l) => l,
    _ => None,
  };
  HttpResponse::Ok().json(obj)
}

#[get("/api/emcall/list")]
pub async fn get_emcall_list(sess: Session, app: web::Data<crate::AppState>) -> impl Responder {
  let login = sess.get::<tb_login::Model>("login").unwrap().unwrap();

  let ret = svc_emcall::qry::Qry::find_all(&app.conn, &login.grp_id).await;
  let obj = match ret {
    Ok(obj) => obj,
    Err(e) => {
      return HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", e));
    }
  };

  HttpResponse::Ok().json(obj)
}

#[post("/api/emcall/save")]
pub async fn save_emcall(app: web::Data<crate::AppState>, data: web::Json<serde_json::Value>) -> impl Responder {
  let ret = svc_emcall::mtn::Mtn::save_emcall(&app.conn, data.into_inner()).await;
  match ret {
    Ok(obj) => HttpResponse::Ok().json(obj.try_into_model().unwrap()),
    Err(e) => HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", e)),
  }
}

#[post("/api/emcall/delete")]
pub async fn delete_emcall(app: web::Data<crate::AppState>, data: web::Json<serde_json::Value>) -> impl Responder {
  let emcall_seq = data.get("emcall_seq").unwrap().as_i64().unwrap() as i32;
  let ret = svc_emcall::mtn::Mtn::delete_emcall(&app.conn, emcall_seq).await;
  match ret {
    Ok(obj) => HttpResponse::Ok().json(crate::models::WebRes {
      rslt: WebCmd::Ok,
      msg: format!("{:?}", obj),
    }),
    Err(e) => HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", e)),
  }
}

#[post("/api/emcall/update_disp_seqs")]
pub async fn update_disp_seqs(app: web::Data<crate::AppState>, data: web::Json<serde_json::Value>) -> impl Responder {
  let ret = svc_emcall::mtn::Mtn::update_disp_seqs(&app.conn, data.into_inner()).await;
  let obj = match ret {
    Ok(obj) => obj,
    Err(e) => return HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", e)),
  };

  HttpResponse::Ok().json(obj)
}
