use crate::{entities::tb_cd::Model, models::WebCmd, svc};
use actix_session::Session;
use actix_web::{get, post, web, HttpRequest, HttpResponse, Responder};
use log::{debug, error, info};
use qstring::QString;
use sea_orm::TryIntoModel;
use svc::conf::svc_cd::mtn::Mtn;

pub fn regist_route(config: &mut web::ServiceConfig) {
  config
    // cd
    .service(list)
    .service(one)
    .service(save)
    .service(delete)
    // end of routes
    ;
}

#[get("/api/cd/one")]
pub async fn one(_sess: Session, app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  //let user = sess.get::<tb_login::Model>("login").unwrap();
  //HttpResponse::Ok().json(user)

  let qs = QString::from(req.query_string());
  if let Some(id) = qs.get("cd") {
    let ret = svc::conf::svc_cd::qry::Qry::find_by_id(&app.conn, id).await;
    let obj = match ret {
      Ok(l) => l,
      Err(e) => {
        error!("err {e:?}");
        None
      }
    };
    HttpResponse::Ok().json(obj)
  } else if let (Some(grp), Some(id)) = (qs.get("grp"), qs.get("id")) {
    let ret = svc::conf::svc_cd::qry::Qry::find_by_grp_id(&app.conn, grp, id).await;
    let obj = match ret {
      Ok(l) => l,
      Err(e) => {
        error!("err {e:?}");
        vec![]
      }
    };

    HttpResponse::Ok().json(obj.get(0))
  } else {
    let obj: Option<Model> = None;
    HttpResponse::Ok().json(obj)
  }
}

#[get("/api/cd/list")]
pub async fn list(_sess: Session, app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  //let user = sess.get::<tb_login::Model>("login").unwrap();
  //HttpResponse::Ok().json(user)
  let qs = QString::from(req.query_string());
  //let grp = qs.get("grp").unwrap().parse::<String>().unwrap();
  let grp = qs.get("grp"); //.parse::<String>();
  match grp {
    Some(grp) => {
      let rlt = svc::conf::svc_cd::qry::Qry::find_by_grp(&app.conn, &grp).await;
      let l = match rlt {
        Ok(l) => l,
        _ => vec![],
      };
      HttpResponse::Ok().json(l)
    }
    None => {
      let rlt = svc::conf::svc_cd::qry::Qry::find_all(&app.conn).await;
      let l = match rlt {
        Ok(l) => l,
        _ => vec![],
      };
      HttpResponse::Ok().json(l)
    }
  }
}

#[post("/api/cd/save")]
pub async fn save(app: web::Data<crate::AppState>, info: web::Json<serde_json::Value>) -> impl Responder {
  debug!("cd info {:?}", info);

  let ret = Mtn::save_cd(&app.conn, info.clone()).await;

  match ret {
    Ok(obj) => HttpResponse::Ok().json(obj.try_into_model().unwrap()),
    Err(e) => HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", e)),
  }
}

#[post("/api/cd/delete")]
pub async fn delete(app: web::Data<crate::AppState>, info: web::Json<serde_json::Value>) -> impl Responder {
  info!("cd info {:?}", info);

  let id = info.get("cd").unwrap().as_str().unwrap();

  let ret = Mtn::delete_cd(&app.conn, id).await;

  match ret {
    Ok(obj) => HttpResponse::Ok().json(crate::models::WebRes {
      rslt: WebCmd::Ok,
      msg: format!("{:?}", obj),
    }),
    Err(e) => HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", e)),
  }
}
