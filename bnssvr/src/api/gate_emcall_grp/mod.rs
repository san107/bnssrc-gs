use crate::{
  models::{WebCmd, WebRes},
  svc::gate::svc_gate_emcall_grp,
};
use actix_session::Session;
use actix_web::{get, post, web, HttpRequest, HttpResponse, Responder};
use log::info;
use qstring::QString;

pub fn regist(config: &mut web::ServiceConfig) {
  config
    .service(list)
    .service(emcalllist)
    .service(saves)
    // end of regist
    ;
}

#[get("/api/gate_emcall_grp/list")]
pub async fn list(app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  //let user = sess.get::<tb_login::Model>("login").unwrap();
  //HttpResponse::Ok().json(user)

  let qs = QString::from(req.query_string());
  let seq = qs.get("gateSeq").unwrap().parse::<i32>().unwrap();

  let ret = svc_gate_emcall_grp::qry::Qry::find_by_gate_seq(&app.conn, seq).await;
  let obj = match ret {
    Ok(l) => l,
    _ => vec![],
  };
  HttpResponse::Ok().json(obj)
}

#[get("/api/gate_emcall_grp/emcalllist")]
pub async fn emcalllist(_sess: Session, app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  //let user = sess.get::<tb_login::Model>("login").unwrap();
  //HttpResponse::Ok().json(user)
  let qs = QString::from(req.query_string());
  let seq = qs.get("gateSeq").unwrap().parse::<i32>().unwrap();

  let rlt = svc_gate_emcall_grp::qry::Qry::find_emcall_grp_by_gate_seq(&app.conn, seq).await;
  let l = match rlt {
    Ok(l) => l,
    _ => vec![],
  };

  HttpResponse::Ok().json(l)
}

/**
 * 전송포맷
 * {gateSeq:seq, list:[{gate_seq:seq, cam_seq:seq}, ... ]}
 */
#[post("/api/gate_emcall_grp/saves")]
pub async fn saves(app: web::Data<crate::AppState>, info: web::Json<serde_json::Value>) -> impl Responder {
  info!("gate_emcall info {:?}", info);

  let ret = svc_gate_emcall_grp::mtn::Mtn::saves(&app.conn, info.clone()).await;

  match ret {
    Ok(obj) => HttpResponse::Ok().json(WebRes {
      rslt: WebCmd::Ok,
      msg: format!("{obj:?}"),
    }),
    Err(e) => {
      log::error!("error {e:?}");
      HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", e))
    }
  }
}
