use crate::{entities::tb_login, svc::user::svc_login};
use actix_session::Session;
use actix_web::{get, post, web, HttpResponse, Responder};
use serde_json::json;

pub fn regist(config: &mut web::ServiceConfig) {
  config
    // login
    .service(list)
    .service(save)
    .service(delete)
    // end of regist
    ;
}

#[get("/api/login/list")]
pub async fn list(sess: Session, app: web::Data<crate::AppState>) -> impl Responder {
  let user = sess.get::<tb_login::Model>("login").unwrap().unwrap();

  log::info!("session {:?} , list", user);

  let rlt = svc_login::qry::Qry::find_all(&app.conn, &user.grp_id).await;
  let list = match rlt {
    Ok(l) => l,
    _ => vec![],
  };
  // 비밀번호를 null 로 변경하여 리턴하도록.
  //let list = l
  let mut list = json!(list);

  for ele in list.as_array_mut().unwrap().iter_mut() {
    *ele.get_mut("user_pass").unwrap() = json!(null);
  }
  HttpResponse::Ok().json(list)
}

async fn has_role(sess: &tb_login::Model, app: &web::Data<crate::AppState>, info: &web::Json<serde_json::Value>) -> bool {
  let userid = info.get("user_id").unwrap().as_str().unwrap();
  let mut save_role: String = info.get("user_role").unwrap().as_str().unwrap().to_owned();

  let dbuser = svc_login::qry::Qry::find_by_id(&app.conn, userid).await.unwrap();
  if let Some(dbuser) = dbuser {
    // 이미 존재하는 경우에는, db_role을 사용함.(권하니 없는자가 db_role을 낮은 권한으로 바꾸는 것도 허용하지 않음. )
    save_role = dbuser.user_role.to_string();
  }
  // Inst 인 경우, 모두 혀용.
  // Admin 인 경우, Inst 만 처리 안됨.
  // User 인 겨우, Admin, Inst  처리 안됨.
  match sess.user_role.as_str() {
    "Inst" => true,
    "Admin" => save_role != "Inst", // 관리자의 경우, 설치자를 저장할 수 없음.
    "User" => save_role != "Inst" && save_role != "Admin", // 사용자의 경우, 설치자, 관리자를저장할 수 없음.
    _ => false,
  }
}

#[post("/api/login/save")]
pub async fn save(sess: Session, app: web::Data<crate::AppState>, info: web::Json<serde_json::Value>) -> impl Responder {
  let user = sess.get::<tb_login::Model>("login").unwrap().unwrap();

  log::info!("session {:?} , save info {:?}", user, info);

  if !has_role(&user, &app, &info).await {
    return HttpResponse::Forbidden().body("Forbidden");
  }

  let ret = svc_login::mtn::Mtn::save(&app.conn, info.clone()).await;

  match ret {
    Ok(obj) => {
      let mut obj = json!(obj).as_object().unwrap().clone();
      obj.remove("user_pass");

      HttpResponse::Ok().json(obj)
    }
    Err(e) => HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", e)),
  }
}

#[post("/api/login/delete")]
pub async fn delete(sess: Session, app: web::Data<crate::AppState>, info: web::Json<serde_json::Value>) -> impl Responder {
  let user = sess.get::<tb_login::Model>("login").unwrap().unwrap();

  log::info!("session {:?} , save info {:?}", user, info);

  if !has_role(&user, &app, &info).await {
    return HttpResponse::Forbidden().body("Forbidden");
  }

  let user_id = info.get("user_id").unwrap().as_str().unwrap();

  let ret = svc_login::mtn::Mtn::delete(&app.conn, user_id).await;

  match ret {
    Ok(obj) => HttpResponse::Ok().json(crate::models::WebRes {
      rslt: crate::models::WebCmd::Ok,
      msg: format!("{:?}", obj),
    }),
    Err(e) => HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", e)),
  }
}
