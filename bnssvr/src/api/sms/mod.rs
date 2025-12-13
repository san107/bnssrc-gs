use crate::{
  models::{WebCmd, WebRes},
  svc::comm::svc_sms_solapi::{self, mtn::SmsInfo},
};
use actix_web::{post, web, HttpResponse, Responder};
use log::{debug, info};

pub fn regist_route(config: &mut web::ServiceConfig) {
  config
    .service(sms_send_info)
    // end of routes
    ;
}

#[post("/api/sms/send_info")]
pub async fn sms_send_info(app: web::Data<crate::AppState>, sms_info: web::Json<SmsInfo>) -> impl Responder {
  info!("sms send info {:?}", sms_info);
  let sms_info = sms_info.into_inner();

  let rlt = svc_sms_solapi::mtn::Mtn::send_sms_info(&app.conn, &sms_info).await;
  debug!("{:?}", rlt);
  if let Err(e) = rlt {
    return HttpResponse::InternalServerError().body(format!("{:?}", e));
  }
  let rlt = rlt.unwrap();
  HttpResponse::Ok().json(WebRes {
    rslt: WebCmd::Ok,
    msg: format!("{rlt:?}"),
  })
}
