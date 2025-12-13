use crate::svc::{self as svc, gate::svc_gate_hist};
use actix_session::Session;
use actix_web::{get, web, HttpRequest, HttpResponse, Responder};
use chrono::{NaiveDateTime, TimeZone};
use qstring::QString;

pub fn regist(config: &mut web::ServiceConfig) {
  config
    // gate
    .service(one)
    .service(list)
    .service(listrange)
    .service(listmonth)
    .service(seqlist)
    .service(pagelist)
    // end of regist
    ;
}

#[get("/api/gate_hist/one")]
pub async fn one(_sess: Session, app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  //let user = sess.get::<tb_login::Model>("login").unwrap();
  //HttpResponse::Ok().json(user)

  let qs = QString::from(req.query_string());
  let seq = qs.get("gateHistSeq").unwrap().parse::<i32>().unwrap();

  let ret = svc::gate::svc_gate::qry::Qry::find_by_id(&app.conn, seq).await;
  let obj = match ret {
    Ok(l) => l,
    _ => None,
  };
  HttpResponse::Ok().json(obj)
}

#[get("/api/gate_hist/list")]
pub async fn list(_sess: Session, app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  //let user = sess.get::<tb_login::Model>("login").unwrap();
  //HttpResponse::Ok().json(user)
  let qs = QString::from(req.query_string());
  let mut limit: u64 = 10;
  if let Some(ok) = qs.get("limit") {
    if let Ok(ok) = ok.parse::<u64>() {
      limit = ok;
    }
  }

  let rlt = svc_gate_hist::qry::Qry::find_all(&app.conn, Some(limit)).await;
  let l = match rlt {
    Ok(l) => l,
    _ => vec![],
  };
  HttpResponse::Ok().json(l)
}

#[get("/api/gate_hist/listrange")]
pub async fn listrange(app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  let qs = QString::from(req.query_string());
  let gate_seq = qs.get("gateSeq").unwrap().parse::<i32>().unwrap();

  use chrono::{DateTime, Local};

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

  let rlt = svc_gate_hist::qry::Qry::find_by_range(&app.conn, gate_seq, start_dt, end_dt).await;
  let l = match rlt {
    Ok(l) => l,
    _ => vec![],
  };
  HttpResponse::Ok().json(l)
}

#[get("/api/gate_hist/listmonth")]
pub async fn listmonth(app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  let qs = QString::from(req.query_string());

  let gate_seq = qs.get("gateSeq").unwrap().parse::<i32>().unwrap();

  let mut year_month: Option<String> = None;
  if let Some(ok) = qs.get("yearMonth") {
    year_month = Some(ok.to_owned());
  }

  let rlt = svc_gate_hist::qry::Qry::find_by_month(&app.conn, gate_seq, &year_month.unwrap()).await;
  let l = match rlt {
    Ok(l) => l,
    _ => vec![],
  };
  HttpResponse::Ok().json(l)
}

#[get("/api/gate_hist/seqlist")]
pub async fn seqlist(_sess: Session, app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  //let user = sess.get::<tb_login::Model>("login").unwrap();
  //HttpResponse::Ok().json(user)

  let qs = QString::from(req.query_string());
  let seq = qs.get("gateSeq").unwrap().parse::<i32>().unwrap();
  let offset = 0;

  let rlt = svc_gate_hist::qry::Qry::find_by_list(&app.conn, seq, offset, None).await;
  let l = match rlt {
    Ok(l) => l,
    _ => vec![],
  };
  HttpResponse::Ok().json(l)
}

#[get("/api/gate_hist/pagelist")]
pub async fn pagelist(_sess: Session, app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  //let user = sess.get::<tb_login::Model>("login").unwrap();
  //HttpResponse::Ok().json(user)

  let qs = QString::from(req.query_string());
  let seq = qs.get("gateSeq").unwrap().parse::<i32>().unwrap();
  let mut limit: u64 = 10;
  if let Some(ok) = qs.get("limit") {
    if let Ok(ok) = ok.parse::<u64>() {
      limit = ok;
    }
  }
  let offset = qs.get("offset").unwrap().parse::<u64>().unwrap();

  let rlt = svc_gate_hist::qry::Qry::find_by_list(&app.conn, seq, offset, Some(limit)).await;
  let l = match rlt {
    Ok(l) => l,
    _ => vec![],
  };
  HttpResponse::Ok().json(l)
}
