use crate::{
  svc::ebrd::svc_ebrd,
  syslog::{txlog, LogLevel, LogType},
};
use actix_web::{web, HttpResponse, Responder};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[allow(dead_code)]
pub fn regist(config: &mut web::ServiceConfig) {
  config
    .route("/api/public/ebrd/v1/weather_msg", web::post().to(weather_msg))
    .route("/api/public/ebrd/v1/event", web::post().to(event))
    .route("/api/public/ebrd/v1/status", web::get().to(status));
}

#[derive(Serialize, Deserialize, Debug)]
struct WeatherMsg {
  ebrd_id: String,
  msg: String,
}

#[derive(Serialize, Deserialize, Debug)]
struct EbrdEvent {
  ebrd_id: String,
  event_type: String,
}

async fn weather_msg(app: web::Data<crate::AppState>, data: web::Json<serde_json::Value>) -> impl Responder {
  log::info!("ebrd weather_msg info {:?}", data);
  let msg: Result<WeatherMsg, serde_json::Error> = serde_json::from_value(data.clone().into());
  if msg.is_err() {
    let emsg = format!("Invalid weather message {data:?} {:?}", msg.err());
    log::error!("{}", emsg);
    return HttpResponse::BadRequest().body(emsg);
  }
  let msg = msg.unwrap();
  log::info!("ebrd weather_msg {:?}", msg);
  // update event msg.

  let ret = svc_ebrd::mtn::Mtn::update_weather_msg(&app.conn, &msg.ebrd_id, &msg.msg).await;
  if ret.is_err() {
    let emsg = format!("Failed to update weather message {msg:?} {:?}", ret.err());
    log::error!("{}", emsg);
    return HttpResponse::InternalServerError().body(emsg);
  }
  let msg = format!("WEATHER_MSG:{}", msg.ebrd_id);
  txlog::demon::send(LogLevel::Info, LogType::EbrdEvt, &msg, data.into_inner()).await;

  HttpResponse::Ok().body("OK")
}

async fn event(app: web::Data<crate::AppState>, data: web::Json<serde_json::Value>) -> impl Responder {
  log::info!("ebrd event info {:?}", data);
  let event: Result<EbrdEvent, serde_json::Error> = serde_json::from_value(data.clone().into());
  if event.is_err() {
    let emsg = format!("Invalid event {data:?} {:?}", event.err());
    log::error!("{}", emsg);
    return HttpResponse::BadRequest().body(emsg);
  }
  let event = event.unwrap();
  log::info!("ebrd event {:?}", event);
  let evttype = event.event_type.as_str();
  if evttype != "EMER_START" && evttype != "EMER_END" {
    let emsg = format!("Invalid event_type {evttype}");
    log::error!("{}", emsg);
    return HttpResponse::BadRequest().body(emsg);
  }
  // update event_type
  let ret = svc_ebrd::mtn::Mtn::update_event(&app.conn, &event.ebrd_id, &evttype).await;
  log::info!("ebrd event ret {:?}", ret);
  if ret.is_err() {
    let emsg = format!("Failed to update event {event:?} {:?}", ret.err());
    log::error!("{}", emsg);
    return HttpResponse::InternalServerError().body(emsg);
  }

  // 로그 남기고.

  let msg = format!("EVT:{}:{}", event.ebrd_id, evttype);
  txlog::demon::send(LogLevel::Info, LogType::EbrdEvt, &msg, data.into_inner()).await;

  // NDMS 연동 처리할 것.

  HttpResponse::Ok().body("OK")
}

async fn status(app: web::Data<crate::AppState>, req: web::Query<HashMap<String, String>>) -> impl Responder {
  log::info!("ebrd status info {:?}", req);
  let ebrd_id = req.get("ebrd_id");
  if ebrd_id.is_none() {
    let emsg = format!("Invalid ebrd_id {req:?}");
    log::error!("{}", emsg);
    return HttpResponse::BadRequest().body(emsg);
  }
  let ebrd_id = ebrd_id.unwrap();

  let ret = svc_ebrd::qry::Qry::find_by_ebrd_id(&app.conn, ebrd_id).await;
  log::info!("ebrd status ret {:?}", ret);
  if ret.is_err() {
    let emsg = format!("Failed to get status {ebrd_id:?} {:?}", ret.err());
    log::error!("{}", emsg);
    return HttpResponse::InternalServerError().body(emsg);
  }
  let model = ret.unwrap();

  if model.is_none() {
    let emsg = format!("Cannot find data. ebrd_id: {ebrd_id}");
    log::error!("{}", emsg);
    return HttpResponse::NotFound().body(emsg);
  }

  let model = model.unwrap();

  HttpResponse::Ok().json(serde_json::json!({
    "ebrd_id": model.ebrd_id,
    "event_type": model.ebrd_event,
    "weather_msg": model.ebrd_weather_msg,
  }))
}
