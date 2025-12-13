use crate::{
  entities::tb_login,
  models::{WebCmd, WebRes},
  svc,
  ws::wsmodels::{WsCmd, WsMsg},
};
use actix_session::Session;
use actix_web::{get, post, web, HttpRequest, HttpResponse, Responder};
use log::info;
use qstring::QString;
use sea_orm::TryIntoModel;
use serde_json::json;
use svc::camera::svc_camera::mtn::Mtn;

pub fn regist_route(config: &mut web::ServiceConfig) {
  config
    // camera
    .service(list)
    .service(grplist)
    .service(childlist)
    .service(searchlist)
    .service(findbywater)
    // .service(one)
    .route("/api/camera/one", web::get().to(one))
    .route("/api/public/camera/one", web::get().to(one))
    .service(save)
    .service(delete)
    .service(update_disp_seqs)
    // end of regist
    ;
}

//#[get("/api/camera/one")]
pub async fn one(_sess: Session, app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  //let user = sess.get::<tb_login::Model>("login").unwrap();
  //HttpResponse::Ok().json(user)

  let qs = QString::from(req.query_string());
  let seq = qs.get("camSeq").unwrap().parse::<i32>().unwrap();

  let ret = svc::camera::svc_camera::qry::Qry::find_by_id(&app.conn, seq).await;
  let obj = match ret {
    Ok(l) => l,
    _ => None,
  };
  HttpResponse::Ok().json(obj)
}

#[get("/api/camera/list")]
pub async fn list(_sess: Session, app: web::Data<crate::AppState>) -> impl Responder {
  //let user = sess.get::<tb_login::Model>("login").unwrap();
  //HttpResponse::Ok().json(user)
  let rlt = svc::camera::svc_camera::qry::Qry::find_all(&app.conn).await;
  let l = match rlt {
    Ok(l) => l,
    _ => vec![],
  };
  HttpResponse::Ok().json(l)
}

#[get("/api/camera/grplist")]
pub async fn grplist(_sess: Session, app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  let qs = QString::from(req.query_string());
  let grp_id = qs.get("grpId").unwrap().to_string();

  let rlt = svc::camera::svc_camera::qry::Qry::find_by_grp_id(&app.conn, grp_id).await;
  let l = match rlt {
    Ok(l) => l,
    Err(e) => {
      log::error!("e {e:?}");
      vec![]
    }
  };
  HttpResponse::Ok().json(l)
}

#[get("/api/camera/childlist")]
pub async fn childlist(_sess: Session, app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  //let user = sess.get::<tb_login::Model>("login").unwrap();
  //HttpResponse::Ok().json(user)
  let qs = QString::from(req.query_string());
  let id: String = qs.get("grpId").unwrap().into();

  let rlt = svc::camera::svc_camera::qry::Qry::find_by_childlist(&app.conn, &id).await;
  let l = match rlt {
    Ok(l) => l,
    _ => vec![],
  };

  HttpResponse::Ok().json(l)
}

#[get("/api/camera/searchlist")]
pub async fn searchlist(_sess: Session, app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  let login = _sess.get::<tb_login::Model>("login").unwrap().unwrap();

  let qs = QString::from(req.query_string());
  let search = qs.get("camNm").unwrap().to_string();
  let offset = 0;

  let rlt = svc::camera::svc_camera::qry::Qry::find_by_name(&app.conn, search, offset, None).await;
  let l = match rlt {
    Ok(l) => l
      .into_iter()
      .filter(|cam| cam.grp_id.contains(&login.grp_id))
      .collect::<Vec<_>>(),
    _ => vec![],
  };
  HttpResponse::Ok().json(l)
}

#[get("/api/camera/findbywater")]
pub async fn findbywater(app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  let qs = QString::from(req.query_string());
  let seq = qs.get("waterSeq").unwrap().to_string();
  let seq: i32 = seq.parse().unwrap();

  let rlt = svc::camera::svc_camera::qry::Qry::find_by_water(&app.conn, seq).await;
  let l = match rlt {
    Ok(l) => l,
    Err(e) => {
      log::error!("e {e:?}");
      vec![]
    }
  };
  HttpResponse::Ok().json(l)
}

#[post("/api/camera/update_disp_seqs")]
pub async fn update_disp_seqs(app: web::Data<crate::AppState>, info: web::Json<serde_json::Value>) -> impl Responder {
  info!("info {:?}", info);

  let ret = Mtn::update_disp_seq(&app.conn, info.clone()).await;

  match ret {
    Ok(_) => HttpResponse::Ok().json(WebRes {
      rslt: WebCmd::Ok,
      msg: format!("update ok"),
    }),
    Err(e) => HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", e)),
  }
}

#[post("/api/camera/save")]
pub async fn save(app: web::Data<crate::AppState>, info: web::Json<serde_json::Value>) -> impl Responder {
  info!("camera info {:?}", info);

  let ret = Mtn::save_camera(&app.conn, info.clone()).await;

  match ret {
    Ok(obj) => {
      let model = obj.try_into_model().unwrap();
      app
        .tx_ws
        .send(Box::from(
          json!(WsMsg {
            cmd: WsCmd::CameraSave,
            data: model.clone(),
          })
          .to_string(),
        ))
        .unwrap();
      HttpResponse::Ok().json(model)
    }
    Err(e) => HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", e)),
  }
}

#[post("/api/camera/delete")]
pub async fn delete(app: web::Data<crate::AppState>, info: web::Json<serde_json::Value>) -> impl Responder {
  info!("camera info {:?}", info);

  let cam_seq = info.get("cam_seq").unwrap().as_i64().unwrap() as i32;

  let ret = Mtn::delete_camera(&app.conn, cam_seq).await;

  match ret {
    Ok(obj) => {
      app
        .tx_ws
        .send(Box::from(
          json!(WsMsg {
            cmd: WsCmd::CameraDel,
            data: cam_seq,
          })
          .to_string(),
        ))
        .unwrap();
      HttpResponse::Ok().json(crate::models::WebRes {
        rslt: WebCmd::Ok,
        msg: format!("{:?}", obj),
      })
    }
    Err(e) => {
      log::error!("e:{e:?}");
      HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", e))
    }
  }
}
