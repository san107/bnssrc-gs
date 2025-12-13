use crate::emcall_app::{self, model::ItgEvent};
use actix_web::{web, HttpResponse, Responder};

#[allow(dead_code)]
pub fn regist(config: &mut web::ServiceConfig) {
  config
    .route("/api/public/itg/event/", web::post().to(event))
    .route("/api/public/itg/event", web::post().to(event));
}

//#[post("/api/public/itg/event")]
async fn event(_app: web::Data<crate::AppState>, data: web::Json<serde_json::Value>) -> impl Responder {
  log::info!("itg event info {:?}", data);
  let event: ItgEvent = serde_json::from_value(data.into_inner()).unwrap();
  log::info!("itg event {:?}", event);
  emcall_app::app::emcall_send(Box::new(event)).await;
  HttpResponse::Ok()
}
