use actix_web::{get, web, HttpResponse, Responder};
use serde::Serialize;
use std::env;

mod ebrd;
mod itg;
mod rtsp;
mod ws;

#[allow(dead_code)]
pub fn regist(config: &mut web::ServiceConfig) {
  itg::regist(config);
  ebrd::regist(config);
  config.service(get_env);
  rtsp::regist(config);
  ws::regist(config);
}

#[derive(Serialize, Debug)]
pub struct Env {
  pub bnssvr_base_url: String,
}

#[get("/api/public/env")]
async fn get_env() -> impl Responder {
  let bnsenv = Env {
    bnssvr_base_url: env::var("BNSSVR_BASE_URL").unwrap_or("http://localhost:3010".to_string()),
  };
  HttpResponse::Ok().json(bnsenv)
}
