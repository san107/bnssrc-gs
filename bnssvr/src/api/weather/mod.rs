use crate::models::WebCmd;
use crate::svc::comm::svc_weather;
use actix_web::{get, post, web, HttpRequest, HttpResponse, Responder};
use qstring::QString;
use sea_orm::TryIntoModel;

pub fn regist(config: &mut web::ServiceConfig) {
  config
    .service(save)
    .service(delete)
    .service(update_disp_seqs)
    .service(one)
    .service(list)
    // end of routes
    ;
}

#[get("/api/weather/one")]
pub async fn one(app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  let qs = QString::from(req.query_string());
  let seq = qs.get("wt_seq").unwrap().parse::<i32>().unwrap();

  let ret = svc_weather::qry::Qry::find_by_id(&app.conn, seq).await;
  let obj = match ret {
    Ok(l) => l,
    _ => None,
  };
  HttpResponse::Ok().json(obj)
}

#[get("/api/weather/list")]
pub async fn list(app: web::Data<crate::AppState>) -> impl Responder {
  let ret = svc_weather::qry::Qry::find_all(&app.conn).await;
  let obj = match ret {
    Ok(obj) => obj,
    Err(e) => {
      return HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", e));
    }
  };

  HttpResponse::Ok().json(obj)
}

#[post("/api/weather/save")]
pub async fn save(app: web::Data<crate::AppState>, data: web::Json<serde_json::Value>) -> impl Responder {
  let ret = svc_weather::mtn::Mtn::save(&app.conn, data.into_inner()).await;
  match ret {
    Ok(obj) => HttpResponse::Ok().json(obj.try_into_model().unwrap()),
    Err(e) => HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", e)),
  }
}

#[post("/api/weather/delete")]
pub async fn delete(app: web::Data<crate::AppState>, data: web::Json<serde_json::Value>) -> impl Responder {
  let wt_seq = data.get("wt_seq").unwrap().as_i64().unwrap() as i32;
  let ret = svc_weather::mtn::Mtn::delete(&app.conn, wt_seq).await;
  match ret {
    Ok(obj) => HttpResponse::Ok().json(crate::models::WebRes {
      rslt: WebCmd::Ok,
      msg: format!("{:?}", obj),
    }),
    Err(e) => HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", e)),
  }
}

#[post("/api/weather/update_disp_seqs")]
pub async fn update_disp_seqs(app: web::Data<crate::AppState>, data: web::Json<serde_json::Value>) -> impl Responder {
  let ret = svc_weather::mtn::Mtn::update_disp_seqs(&app.conn, data.into_inner()).await;
  let obj = match ret {
    Ok(obj) => obj,
    Err(e) => return HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", e)),
  };

  HttpResponse::Ok().json(obj)
}
