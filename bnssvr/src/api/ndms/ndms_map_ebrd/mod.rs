use crate::{
  models::{WebCmd, WebRes},
  svc::ndms::svc_ndms_map_ebrd::{self, mtn::Mtn},
};
use actix_web::{get, post, web, HttpRequest, HttpResponse, Responder};
use log::info;
use qstring::QString;

pub fn regist_route(config: &mut web::ServiceConfig) {
  config
  .service(list)
  .service(saves)
  // end of routes 
  ;
}

#[get("/api/ndms_map_ebrd/list")]
pub async fn list(app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  //let user = sess.get::<tb_login::Model>("login").unwrap();
  //HttpResponse::Ok().json(user)

  let qs = QString::from(req.query_string());
  let flcode = qs.get("flcode");
  // 값이 존재하면.
  if let Some(flcode) = flcode {
    let ret = svc_ndms_map_ebrd::qry::Qry::find_by_flcode(&app.conn, flcode).await;
    let obj = match ret {
      Ok(l) => l,
      _ => vec![],
    };
    return HttpResponse::Ok().json(obj);
  }

  let ret = svc_ndms_map_ebrd::qry::Qry::find_all(&app.conn).await;
  let obj = match ret {
    Ok(l) => l,
    _ => vec![],
  };
  HttpResponse::Ok().json(obj)
}

/**
 * 전송포맷
 * {gateSeq:seq, list:[{gate_seq:seq, cam_seq:seq}, ... ]}
 */
#[post("/api/ndms_map_ebrd/saves")]
pub async fn saves(app: web::Data<crate::AppState>, info: web::Json<serde_json::Value>) -> impl Responder {
  info!("ndms_map_ebrd info {:?}", info);

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
