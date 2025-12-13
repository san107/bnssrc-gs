use actix_web::web;

pub fn register(config: &mut web::ServiceConfig) {
  config
    .route("/wsevent", web::get().to(super::wsevent::wsevent))
    .route("/testecho", web::get().to(super::testecho::echo));
}
