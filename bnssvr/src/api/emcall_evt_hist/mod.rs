use crate::svc::emcall::svc_emcall_evt_hist;
use actix_session::Session;
use actix_web::{get, web, HttpRequest, HttpResponse, Responder};
use chrono::TimeZone;
use qstring::QString;

pub fn regist_route(config: &mut web::ServiceConfig) {
  config
        .service(pagelist)
        .service(listrange)
        // end of regist
        ;
}

#[get("/api/emcall_evt_hist/pagelist")]
pub async fn pagelist(_sess: Session, app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  let qs = QString::from(req.query_string());
  let id = qs.get("emcallId").unwrap();
  let mut limit: u64 = 10;
  if let Some(ok) = qs.get("limit") {
    if let Ok(ok) = ok.parse::<u64>() {
      limit = ok;
    }
  }
  let offset = qs.get("offset").unwrap().parse::<u64>().unwrap();

  let rlt = svc_emcall_evt_hist::qry::Qry::find_by_list(&app.conn, &id, offset, Some(limit)).await;
  let l = match rlt {
    Ok(l) => l,
    _ => vec![],
  };
  HttpResponse::Ok().json(l)
}

#[get("/api/emcall_evt_hist/listrange")]
pub async fn listrange(app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  let qs = QString::from(req.query_string());
  let id = qs.get("emcallId").unwrap();

  use chrono::{DateTime, Local, NaiveDateTime};

  let mut start_dt: Option<DateTime<Local>> = None;
  if let Some(ok) = qs.get("start") {
    log::info!("start: {:?}", ok);
    if let Ok(dt) = NaiveDateTime::parse_from_str(ok, "%Y-%m-%dT%H:%M:%S") {
      start_dt = Some(Local.from_local_datetime(&dt).unwrap());
    }
  }

  let mut end_dt: Option<DateTime<Local>> = None;
  if let Some(ok) = qs.get("end") {
    if let Ok(dt) = NaiveDateTime::parse_from_str(ok, "%Y-%m-%dT%H:%M:%S") {
      end_dt = Some(Local.from_local_datetime(&dt).unwrap());
    }
  }

  let rlt = svc_emcall_evt_hist::qry::Qry::find_by_range(&app.conn, &id, start_dt, end_dt).await;
  let l = match rlt {
    Ok(l) => l,
    _ => vec![],
  };
  HttpResponse::Ok().json(l)
}
