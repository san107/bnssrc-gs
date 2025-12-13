use crate::{
  models::{WebCmd, WebRes},
  svc,
};
use actix_session::Session;
use actix_web::{get, post, web, HttpRequest, HttpResponse, Responder};
use log::info;
use qstring::QString;
use sea_orm::TryIntoModel;
// use serde_json::json;
use svc::user::svc_grp_tree::mtn::Mtn;

pub fn regist_route(config: &mut web::ServiceConfig) {
  config
    // grp_tree
    .service(list)
    .service(one)
    .service(parentlist)
    .service(childlist)
    .service(save)
    .service(delete)
    // end of regist
    ;
}

#[get("/api/grp_tree/one")]
pub async fn one(_sess: Session, app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  //let user = sess.get::<tb_login::Model>("login").unwrap();
  //HttpResponse::Ok().json(user)

  let qs: QString = QString::from(req.query_string());
  let parent_id: String = qs.get("parentId").unwrap().into();
  let childe_id: String = qs.get("childId").unwrap().into();

  let ret = svc::user::svc_grp_tree::qry::Qry::find_by_id(&app.conn, &parent_id, &childe_id).await;
  let obj = match ret {
    Ok(l) => l,
    _ => None,
  };
  HttpResponse::Ok().json(obj)
}

#[get("/api/grp_tree/list")]
pub async fn list(_sess: Session, app: web::Data<crate::AppState>) -> impl Responder {
  //let user = sess.get::<tb_login::Model>("login").unwrap();
  //HttpResponse::Ok().json(user)
  let rlt = svc::user::svc_grp_tree::qry::Qry::find_all(&app.conn).await;
  let l = match rlt {
    Ok(l) => l,
    _ => vec![],
  };
  HttpResponse::Ok().json(l)
}

#[get("/api/grp_tree/parentlist")]
pub async fn parentlist(_sess: Session, app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  //let user = sess.get::<tb_login::Model>("login").unwrap();
  //HttpResponse::Ok().json(user)
  let qs: QString = QString::from(req.query_string());
  let parent_id: String = qs.get("parentId").unwrap().into();

  let rlt = svc::user::svc_grp_tree::qry::Qry::find_by_parent(&app.conn, &parent_id).await;
  let l = match rlt {
    Ok(l) => l,
    _ => vec![],
  };
  HttpResponse::Ok().json(l)
}

#[get("/api/grp_tree/childlist")]
pub async fn childlist(_sess: Session, app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  //let user = sess.get::<tb_login::Model>("login").unwrap();
  //HttpResponse::Ok().json(user)
  let qs: QString = QString::from(req.query_string());
  let child_id: String = qs.get("childId").unwrap().into();

  let rlt = svc::user::svc_grp_tree::qry::Qry::find_by_child(&app.conn, &child_id).await;
  let l = match rlt {
    Ok(l) => l,
    _ => vec![],
  };
  HttpResponse::Ok().json(l)
}

#[post("/api/grp_tree/save")]
pub async fn save(app: web::Data<crate::AppState>, info: web::Json<serde_json::Value>) -> impl Responder {
  info!("grp info {:?}", info);

  let ret = Mtn::save_grp_tree(&app.conn, info.clone()).await;
  info!("ret {:?}", ret);

  match ret {
    Ok(obj) => HttpResponse::Ok().json(obj.try_into_model().unwrap()),
    Err(e) => HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", e)),
  }
}

#[post("/api/grp_tree/delete")]
pub async fn delete(app: web::Data<crate::AppState>, info: web::Json<serde_json::Value>) -> impl Responder {
  // info!("group info {:?}", info);

  let parent_id = info.get("parent_id").unwrap().as_str().unwrap();
  let child_id = info.get("child_id").unwrap().as_str().unwrap();

  let ret = Mtn::delete_grp_tree(&app.conn, &parent_id, &child_id).await;

  match ret {
    Ok(obj) => HttpResponse::Ok().json(WebRes {
      rslt: WebCmd::Ok,
      msg: format!("{:?}", obj),
    }),
    Err(e) => HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", e)),
  }
}
