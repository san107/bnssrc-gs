use crate::{entities::tb_login, svc::user::svc_login::qry::Qry};
use actix_session::Session;
use actix_web::{get, post, web, HttpResponse, Responder};
use bcrypt::verify;
use serde::{Deserialize, Serialize};
use std::ops::Deref;

pub fn regist(config: &mut web::ServiceConfig) {
  config
    // auth
    .service(authlogin)
    .service(getauthlogin)
    .service(getauthlogout);
}

#[derive(Serialize, Deserialize, Debug)]
struct IdPass {
  user_id: String,
  user_pass: String,
}

#[post("/api/auth/login")]
pub async fn authlogin(
  sess: Session,
  app: web::Data<crate::AppState>,
  info: web::Json<IdPass>,
) -> Result<HttpResponse, actix_web::Error> {
  // 보안상 로그남기면 안됨.
  //info!("authlogin  {:?}", info);

  let model = info.deref();

  let user = Qry::find_by_id(&app.conn, &model.user_id).await;
  match user {
    Ok(user) => match user {
      Some(mut user) => {
        let pass = format!("{}{}", user.user_role, model.user_pass);
        if let Ok(ok) = verify(&pass, &user.user_pass) {
          if ok {
            user.user_pass = "".to_owned();
            sess.insert("login", user.clone()).unwrap();
            Ok(HttpResponse::Ok().json(user))
          } else {
            log::error!("login fail {:?}", model);
            Ok(HttpResponse::Unauthorized().body(""))
          }
        } else {
          log::error!("login fail {:?}", model);
          Ok(HttpResponse::Unauthorized().body(""))
        }
      }
      None => {
        log::error!("login fail {:?}", model);
        Ok(HttpResponse::NotFound().body("not found"))
      }
    },
    Err(_e) => Ok(HttpResponse::InternalServerError().body("InternalServerError")),
  }
}

#[get("/api/auth/login")]
pub async fn getauthlogin(sess: Session) -> impl Responder {
  let user = sess.get::<tb_login::Model>("login").unwrap();
  HttpResponse::Ok().json(user)
}

#[get("/api/auth/logout")]
pub async fn getauthlogout(sess: Session) -> impl Responder {
  sess.remove("login");
  HttpResponse::Ok().body("OK")
}
