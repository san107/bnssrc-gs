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
use svc::water::svc_water::mtn::Mtn;

pub mod istec;

pub fn regist_route(config: &mut web::ServiceConfig) {
  config
    .service(list)
    .service(grplist)
    .service(childlist)
    .service(searchlist)
    .service(one)
    .service(update_disp_seqs)
    .service(save)
    .service(delete)
    .service(max_water_id)
    //.service(istec::eventmsg)
    .route("/api/water/istec/eventmsg", web::post().to(istec::eventmsg))
    .route("/api/public/water/eventmsg", web::post().to(istec::eventmsg))
    // end of routes
    ;
}

#[get("/api/water/one")]
pub async fn one(_sess: Session, app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  //let user = sess.get::<tb_login::Model>("login").unwrap();
  //HttpResponse::Ok().json(user)

  let qs = QString::from(req.query_string());
  let seq = qs.get("waterSeq").unwrap().parse::<i32>().unwrap();

  let ret = svc::water::svc_water::qry::Qry::find_by_id(&app.conn, seq).await;
  let obj = match ret {
    Ok(l) => l,
    _ => None,
  };
  HttpResponse::Ok().json(obj)
}

#[get("/api/water/max_water_id")]
pub async fn max_water_id(app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  let qs = QString::from(req.query_string());
  let water_type = qs.get("water_type").unwrap();

  let ret = svc::water::svc_water::qry::Qry::max_water_id(&app.conn, water_type).await;

  match ret {
    Ok(l) => HttpResponse::Ok().json(l),
    Err(e) => HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", e)),
  }
}

#[get("/api/water/list")]
pub async fn list(_sess: Session, app: web::Data<crate::AppState>) -> impl Responder {
  //let user = sess.get::<tb_login::Model>("login").unwrap();
  //HttpResponse::Ok().json(user)
  let rlt = svc::water::svc_water::qry::Qry::find_all(&app.conn).await;
  let l = match rlt {
    Ok(l) => l,
    _ => vec![],
  };
  HttpResponse::Ok().json(l)
}

#[get("/api/water/grplist")]
pub async fn grplist(_sess: Session, app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  let qs = QString::from(req.query_string());
  let grp_id = qs.get("grpId").unwrap().to_string();

  let rlt = svc::water::svc_water::qry::Qry::find_by_grp_id(&app.conn, grp_id).await;
  let l = match rlt {
    Ok(l) => l,
    Err(e) => {
      log::error!("e {e:?}");
      vec![]
    }
  };
  HttpResponse::Ok().json(l)
}

#[get("/api/water/childlist")]
pub async fn childlist(_sess: Session, app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  //let user = sess.get::<tb_login::Model>("login").unwrap();
  //HttpResponse::Ok().json(user)
  let qs = QString::from(req.query_string());
  let id: String = qs.get("grpId").unwrap().into();

  let rlt = svc::water::svc_water::qry::Qry::find_by_childlist(&app.conn, &id).await;
  let l = match rlt {
    Ok(l) => l,
    _ => vec![],
  };

  HttpResponse::Ok().json(l)
}

#[get("/api/water/searchlist")]
pub async fn searchlist(_sess: Session, app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  let login = _sess.get::<tb_login::Model>("login").unwrap().unwrap();

  let qs = QString::from(req.query_string());
  let search = qs.get("waterNm").unwrap().to_string();
  let offset = 0;

  let rlt = svc::water::svc_water::qry::Qry::find_by_name(&app.conn, search, offset, None).await;
  let l = match rlt {
    Ok(l) => l
      .into_iter()
      .filter(|water| water.grp_id.contains(&login.grp_id))
      .collect::<Vec<_>>(),
    _ => vec![],
  };
  HttpResponse::Ok().json(l)
}

#[post("/api/water/update_disp_seqs")]
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

#[post("/api/water/save")]
pub async fn save(app: web::Data<crate::AppState>, info: web::Json<serde_json::Value>) -> impl Responder {
  info!("water info {:?}", info);

  let ret = Mtn::save(&app.conn, info.clone()).await;

  match ret {
    Ok(obj) => {
      let model = obj.try_into_model().unwrap();
      app
        .tx_ws
        .send(Box::from(
          json!(WsMsg {
            cmd: WsCmd::WaterSave,
            data: model.clone(),
          })
          .to_string(),
        ))
        .unwrap();
      HttpResponse::Ok().json(model)
    }
    Err(e) => {
      if e.to_string().contains("Duplicate entry") && e.to_string().contains("idx_water_01") {
        HttpResponse::BadRequest().json(serde_json::json!({
          "error": "등록된 수위계 ID입니다. 다른 ID를 사용해주세요."
        }))
      } else {
        HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", e))
      }
    }
  }
}

#[post("/api/water/delete")]
pub async fn delete(app: web::Data<crate::AppState>, info: web::Json<serde_json::Value>) -> impl Responder {
  info!("water info {:?}", info);

  let water_seq = info.get("water_seq").unwrap().as_i64().unwrap() as i32;

  let ret = Mtn::delete(&app.conn, water_seq).await;

  match ret {
    Ok(obj) => {
      app
        .tx_ws
        .send(Box::from(
          json!(WsMsg {
            cmd: WsCmd::WaterDel,
            data: water_seq,
          })
          .to_string(),
        ))
        .unwrap();
      HttpResponse::Ok().json(crate::models::WebRes {
        rslt: WebCmd::Ok,
        msg: format!("{:?}", obj),
      })
    }
    Err(e) => HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", e)),
  }
}
