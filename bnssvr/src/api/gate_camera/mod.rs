use crate::{
  entities::tb_login,
  models::{WebCmd, WebRes},
  svc::{self as svc, gate::svc_gate_camera::mtn::Mtn},
};
use actix_session::Session;
use actix_web::{get, post, web, HttpRequest, HttpResponse, Responder};
use log::info;
use qstring::QString;

pub fn regist(config: &mut web::ServiceConfig) {
  config
    // gate_camera
    .service(list)
    .service(camlist)
    .service(saves)
    // end of regist
    ;
}

#[get("/api/gate_camera/list")]
pub async fn list(_sess: Session, app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  //let user = sess.get::<tb_login::Model>("login").unwrap();
  //HttpResponse::Ok().json(user)

  let qs = QString::from(req.query_string());
  let seq = qs.get("gateSeq").unwrap().parse::<i32>().unwrap();

  let ret = svc::gate::svc_gate_camera::qry::Qry::find_by_id(&app.conn, seq).await;
  let obj = match ret {
    Ok(l) => l,
    _ => vec![],
  };
  HttpResponse::Ok().json(obj)
}

#[get("/api/gate_camera/camlist")]
pub async fn camlist(_sess: Session, app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  let login = _sess.get::<tb_login::Model>("login").unwrap().unwrap();

  let qs = QString::from(req.query_string());
  let seq = qs.get("gateSeq").unwrap().parse::<i32>().unwrap();

  let rlt = svc::gate::svc_gate_camera::qry::Qry::find_by_withcam(&app.conn, seq).await;
  let l = match rlt {
    Ok(l) => {
      if login.grp_id == "R001" {
        l
      } else {
        l.into_iter()
          .filter(|gate| gate.grp_id.contains(&login.grp_id))
          .collect::<Vec<_>>()
      }
    },
    _ => vec![],
  };

  HttpResponse::Ok().json(l)
}

/**
 * 전송포맷
 * {gateSeq:seq, list:[{gate_seq:seq, cam_seq:seq}, ... ]}
 */
#[post("/api/gate_camera/saves")]
pub async fn saves(app: web::Data<crate::AppState>, info: web::Json<serde_json::Value>) -> impl Responder {
  info!("gate_camera info {:?}", info);

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
