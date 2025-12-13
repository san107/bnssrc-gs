//#![allow(clippy::type_complexity)]
use crate::entities::tb_login;
use actix_session::{Session, SessionExt};
use actix_web::body::EitherBody;
use actix_web::dev::{ServiceRequest, ServiceResponse};
use actix_web::{dev, dev::Service, dev::Transform, Error, HttpResponse};
use futures_util::future::LocalBoxFuture;
use log::error;
use std::future::{ready, Ready};
/*
로그인 없이 접근 가능한 URL목록.
*/
fn get_allows() -> Vec<&'static str> {
  vec![
    "/api/auth/login", // 로그인 로그아웃은 아무나 호출.
    "/api/auth/logout",
    "/api/water/istec/eventmsg", // 로그인 없이 전송가능함.
                                 // "/api/req/search",           // vworld search.
                                 // "/api/req/address",          // vworld search.
  ]
}

pub fn get_session_data(sess: &Session) -> Option<tb_login::Model> {
  let user = sess.get::<tb_login::Model>("login");
  match user {
    Ok(user) => user,
    _ => return None,
  }
}

pub struct AuthMiddleware<S> {
  service: S,
}

impl<S, B> Service<ServiceRequest> for AuthMiddleware<S>
where
  S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
  S::Future: 'static,
  B: 'static,
{
  type Response = ServiceResponse<EitherBody<B>>;
  type Error = Error;
  //type Future = Pin<Box<dyn Future<Output = Result<Self::Response, Self::Error>>>>;
  type Future = LocalBoxFuture<'static, Result<Self::Response, Self::Error>>;
  dev::forward_ready!(service);

  fn call(&self, req: ServiceRequest) -> Self::Future {
    let path = req.path().to_string();
    if !path.starts_with("/api") || path.starts_with("/api/public/") || path.starts_with("/api/rtsp/") {
      let res = self.service.call(req);
      return Box::pin(async move { res.await.map(ServiceResponse::map_into_left_body) });
    }
    let allows = get_allows();
    if allows.contains(&path.as_str()) {
      let res = self.service.call(req);
      return Box::pin(async move { res.await.map(ServiceResponse::map_into_left_body) });
    }
    // info!("req.path:{}", req.path());
    // info!("path:{}", path);
    if get_session_data(&req.get_session()).is_none() {
      error!("Unauthorized Path {path}");
      let (request, _pl) = req.into_parts();
      let response = HttpResponse::Unauthorized()
        .finish()
        // constructed responses map to "right" body
        .map_into_right_body();

      Box::pin(async { Ok(ServiceResponse::new(request, response)) })
      //Ok(req.into_response(actix_web::error::ErrorNetworkAuthenticationRequired("Unauthenticated")))
    } else {
      req.get_session().renew();
      let res = self.service.call(req);
      Box::pin(async move { res.await.map(ServiceResponse::map_into_left_body) })
    }
  }
}

#[derive(Clone)]
pub struct AuthService;

impl<S, B> Transform<S, ServiceRequest> for AuthService
where
  S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
  S::Future: 'static,
  B: 'static,
{
  type Response = ServiceResponse<EitherBody<B>>;
  type Error = Error;
  type InitError = ();
  type Transform = AuthMiddleware<S>;
  //type Future = Ready<Result<Self::Transform, Self::InitError>>;
  type Future = Ready<Result<Self::Transform, Self::InitError>>;
  fn new_transform(&self, service: S) -> Self::Future {
    ready(Ok(AuthMiddleware { service }))
  }
}
