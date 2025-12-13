use crate::ws::wssender;
use actix_web::{post, web, HttpResponse, Responder};

#[allow(dead_code)]
pub fn regist(config: &mut web::ServiceConfig) {
  config.service(broadcast);
}

#[post("/api/public/ws/broadcast")]
async fn broadcast(_app: web::Data<crate::AppState>, data: web::Json<serde_json::Value>) -> impl Responder {
  let json = serde_json::to_string(&data.into_inner()).unwrap();
  log::info!("ws broadcast {:?}", json);
  wssender::send(json).await;
  HttpResponse::Ok()
}
