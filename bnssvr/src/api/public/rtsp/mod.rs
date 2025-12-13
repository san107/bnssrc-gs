use actix_web::{post, web, HttpResponse, Responder};

use crate::rtsp::{self, stat_mgr::CamCmd};

pub fn regist(config: &mut web::ServiceConfig) {
  // itg::regist(config);
  // ebrd::regist(config);
  // config.service(get_env);
  config.service(camcmd);
}

#[post("/api/public/rtsp/camcmd")]
pub async fn camcmd(_app: web::Data<crate::AppState>, info: web::Json<serde_json::Value>) -> impl Responder {
  log::debug!("camcmd info {:?}", info);

  let camcmd: CamCmd = serde_json::from_value(info.into_inner()).unwrap();
  log::debug!("camcmd {:?}", camcmd);

  rtsp::stat_mgr::send_stat(camcmd.cam_seq, camcmd.cam_stat).await;

  HttpResponse::Ok().body("OK")
}
