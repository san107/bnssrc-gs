use actix_web::{get, post, web, HttpRequest, HttpResponse, Responder};
use qstring::QString;
use sea_orm::TryIntoModel;

use crate::{models::WebCmd, svc::ebrd::svc_ebrd_map_msg};

pub fn regist_route(config: &mut web::ServiceConfig) {
  config.service(get_one)
    .service(get_list)
    .service(save)
    .service(delete)
    .service(get_cnt)
    // end of routes
    ;
}

#[get("/api/ebrd_map_msg/cnt")]
pub async fn get_cnt(app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  let qs = QString::from(req.query_string());
  let seq = qs.get("ebrd_seq").unwrap().parse::<i32>().unwrap();

  let ret = svc_ebrd_map_msg::qry::Qry::find_cnt(&app.conn, seq).await;
  if ret.is_err() {
    return HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", ret.err()));
  }
  let obj = ret.unwrap();
  if obj.is_none() {
    return HttpResponse::InternalServerError().body(format!("InternalServerError obj is none"));
  }

  let obj = obj.unwrap();

  HttpResponse::Ok().json(serde_json::json!({
    "tot": obj.0,
    "send": obj.1,
  }))
}

#[get("/api/ebrd_map_msg/one")]
pub async fn get_one(app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  let qs = QString::from(req.query_string());
  let seq = qs.get("ebrd_seq").unwrap().parse::<i32>().unwrap();
  let pos = qs.get("ebrd_msg_pos").unwrap().parse::<i32>().unwrap();

  let ret = svc_ebrd_map_msg::qry::Qry::find_by_id(&app.conn, seq, pos).await;
  let obj = match ret {
    Ok(l) => l,
    _ => None,
  };
  HttpResponse::Ok().json(obj)
}

#[get("/api/ebrd_map_msg/list")]
pub async fn get_list(app: web::Data<crate::AppState>) -> impl Responder {
  let ret = svc_ebrd_map_msg::qry::Qry::find_all(&app.conn).await;
  let obj = match ret {
    Ok(l) => l,
    _ => vec![],
  };
  HttpResponse::Ok().json(obj)
}

#[post("/api/ebrd_map_msg/save")]
pub async fn save(app: web::Data<crate::AppState>, data: web::Json<serde_json::Value>) -> impl Responder {
  let ret = svc_ebrd_map_msg::mtn::Mtn::save(&app.conn, data.into_inner()).await;
  match ret {
    Ok(obj) => HttpResponse::Ok().json(obj.try_into_model().unwrap()),
    Err(e) => HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", e)),
  }
}

#[post("/api/ebrd_map_msg/delete")]
pub async fn delete(app: web::Data<crate::AppState>, data: web::Json<serde_json::Value>) -> impl Responder {
  let seq = data.get("ebrd_seq").unwrap().as_i64().unwrap() as i32;
  let pos = data.get("ebrd_msg_pos").unwrap().as_i64().unwrap() as i32;
  let ret = svc_ebrd_map_msg::mtn::Mtn::delete(&app.conn, seq, pos).await;
  match ret {
    Ok(obj) => HttpResponse::Ok().json(crate::models::WebRes {
      rslt: WebCmd::Ok,
      msg: format!("{:?}", obj),
    }),
    Err(e) => HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", e)),
  }
}
