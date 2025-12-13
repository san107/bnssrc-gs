use crate::{
  entities::tb_login,
  models::{WebCmd, WebRes},
  svc::{self as svc, water::svc_water_gate::mtn::Mtn},
};
use actix_session::Session;
use actix_web::{get, post, web, HttpRequest, HttpResponse, Responder};
use log::info;
use qstring::QString;

pub fn regist_route(config: &mut web::ServiceConfig) {
  config
    .service(list)
    .service(gatelist)
    .service(saves)
    // end of routes
    ;
}

#[get("/api/water_gate/list")]
pub async fn list(app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  //let user = sess.get::<tb_login::Model>("login").unwrap();
  //HttpResponse::Ok().json(user)

  let qs = QString::from(req.query_string());
  let seq = qs.get("waterSeq").unwrap().parse::<i32>().unwrap();

  let ret = svc::water::svc_water_gate::qry::Qry::find_by_water(&app.conn, seq).await;
  let obj = match ret {
    Ok(l) => l,
    _ => vec![],
  };
  HttpResponse::Ok().json(obj)
}

#[get("/api/water_gate/gatelist")]
pub async fn gatelist(_sess: Session, app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  let login = _sess.get::<tb_login::Model>("login").unwrap().unwrap();

  let qs = QString::from(req.query_string());
  let seq = qs.get("waterSeq").unwrap().parse::<i32>().unwrap();

  let rlt = svc::water::svc_water_gate::qry::Qry::find_gate_by_water_seq(&app.conn, seq).await;
  let l = match rlt {
    Ok(l) => {
      if login.grp_id == "R001" {
        l
      } else {
        l.into_iter()
          .filter(|gate| gate.grp_id.contains(&login.grp_id))
          .collect::<Vec<_>>()
      }
    }
    _ => vec![],
  };

  HttpResponse::Ok().json(l)
}

/**
 * 전송포맷
 * {gateSeq:seq, list:[{gate_seq:seq, cam_seq:seq}, ... ]}
 */
#[post("/api/water_gate/saves")]
pub async fn saves(app: web::Data<crate::AppState>, info: web::Json<serde_json::Value>) -> impl Responder {
  info!("water_gate info {:?}", info);

  let ret = Mtn::saves(&app.conn, info.clone()).await;

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
