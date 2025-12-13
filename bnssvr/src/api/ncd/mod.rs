use crate::{
  models::WebCmd,
  svc::{self, conf::svc_ncd},
};
use actix_web::{get, post, web, HttpRequest, HttpResponse, Responder};
use log::{debug, info};
use qstring::QString;
use sea_orm::TryIntoModel;
use svc::conf::svc_ncd::mtn::Mtn;

pub fn regist(config: &mut web::ServiceConfig) {
  config
    .service(save)
    .service(delete)
    .service(one)
    .service(list)
    // end of routes
    ;
}

#[get("/api/ncd/one")]
pub async fn one(app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  let qs = QString::from(req.query_string());
  let grp = qs.get("ncd_grp").unwrap().parse::<String>().unwrap();
  let id = qs.get("ncd_id").unwrap().parse::<i32>().unwrap();

  let ret = svc::conf::svc_ncd::qry::Qry::find_by_id(&app.conn, &grp, id).await;

  let model = ret.unwrap().unwrap();

  HttpResponse::Ok().json(model)
}

#[get("/api/ncd/list")]
pub async fn list(app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  let qs = QString::from(req.query_string());

  let grp = qs.get("grp"); //.parse::<String>();
  match grp {
    Some(grp) => {
      let rlt = svc_ncd::qry::Qry::find_by_grp(&app.conn, &grp).await;
      let l = match rlt {
        Ok(l) => l,
        _ => vec![],
      };
      HttpResponse::Ok().json(l)
    }
    None => {
      let rlt = svc_ncd::qry::Qry::find_all(&app.conn).await;
      let l = match rlt {
        Ok(l) => l,
        _ => vec![],
      };
      HttpResponse::Ok().json(l)
    }
  }
}

#[post("/api/ncd/save")]
pub async fn save(app: web::Data<crate::AppState>, info: web::Json<serde_json::Value>) -> impl Responder {
  debug!("cd info {:?}", info);

  let ret = Mtn::save_cd(&app.conn, info.clone()).await;

  match ret {
    Ok(obj) => HttpResponse::Ok().json(obj.try_into_model().unwrap()),
    Err(e) => HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", e)),
  }
}

#[post("/api/ncd/delete")]
pub async fn delete(app: web::Data<crate::AppState>, info: web::Json<serde_json::Value>) -> impl Responder {
  info!("cd info {:?}", info);

  let grp = info.get("ncd_grp").unwrap().as_str().unwrap();
  let id = info.get("ncd_id").unwrap().as_i64().unwrap() as i32;

  let ret = Mtn::delete_cd(&app.conn, grp, id).await;

  match ret {
    Ok(obj) => HttpResponse::Ok().json(crate::models::WebRes {
      rslt: WebCmd::Ok,
      msg: format!("{:?}", obj),
    }),
    Err(e) => HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", e)),
  }
}
