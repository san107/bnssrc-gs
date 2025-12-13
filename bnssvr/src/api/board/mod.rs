use crate::entities::tb_board;
use crate::{
  models::{WebCmd, WebRes},
  svc,
};
use actix_multipart::form::bytes::Bytes;
use actix_multipart::form::{json::Json as MpJson, MultipartForm};
use actix_session::Session;
use actix_web::{get, post, web, HttpRequest, HttpResponse, Responder};
use log::info;
use qstring::QString;
use sea_orm::TryIntoModel;
use svc::comm::svc_board::mtn::Mtn;

pub fn regist_route(config: &mut web::ServiceConfig) {
  config
    // board
    .service(list)
    .service(one)
    .service(save)
    .service(save_form)
    .service(delete)
    .service(update_disp_seqs)
    // end of regist
    ;
}

#[get("/api/board/list")]
pub async fn list(_sess: Session, app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  let qs = QString::from(req.query_string());
  let bd_type = qs.get("bd_type");

  let rlt = svc::comm::svc_board::qry::Qry::find_all(&app.conn, bd_type).await;
  let l = match rlt {
    Ok(l) => l,
    _ => vec![],
  };
  HttpResponse::Ok().json(l)
}

#[get("/api/board/one")]
pub async fn one(_sess: Session, app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  let qs = QString::from(req.query_string());
  let seq = qs.get("bdSeq").unwrap().parse::<i32>().unwrap();

  let ret = svc::comm::svc_board::qry::Qry::find_by_id(&app.conn, seq).await;
  let obj = match ret {
    Ok(l) => l,
    _ => None,
  };
  HttpResponse::Ok().json(obj)
}

#[post("/api/board/save")]
pub async fn save(app: web::Data<crate::AppState>, info: web::Json<serde_json::Value>) -> impl Responder {
  info!("board info {:?}", info);

  let ret = Mtn::save(&app.conn, info.clone()).await;

  match ret {
    Ok(obj) => HttpResponse::Ok().json(obj.try_into_model().unwrap()),
    Err(e) => HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", e)),
  }
}

#[post("/api/board/delete")]
pub async fn delete(app: web::Data<crate::AppState>, info: web::Json<serde_json::Value>) -> impl Responder {
  info!("board info {:?}", info);

  let seq = info.get("bd_seq").unwrap().as_i64().unwrap() as i32;

  let ret = Mtn::delete(&app.conn, seq).await;

  match ret {
    Ok(obj) => HttpResponse::Ok().json(crate::models::WebRes {
      rslt: WebCmd::Ok,
      msg: format!("{:?}", obj),
    }),
    Err(e) => HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", e)),
  }
}

#[post("/api/board/update_disp_seqs")]
pub async fn update_disp_seqs(app: web::Data<crate::AppState>, data: web::Json<serde_json::Value>) -> impl Responder {
  let ret = svc::comm::svc_board::mtn::Mtn::update_disp_seqs(&app.conn, data.into_inner()).await;

  match ret {
    Ok(_) => HttpResponse::Ok().json(WebRes {
      rslt: WebCmd::Ok,
      msg: format!("update ok"),
    }),
    Err(e) => HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", e)),
  }
}

#[derive(Debug, MultipartForm)]
#[allow(dead_code)]
struct UploadForm {
  #[multipart(limit = "20MB")]
  file: Option<Bytes>,
  json: MpJson<tb_board::Model>,
}

#[post("/api/board/save_form")]
pub async fn save_form(app: web::Data<crate::AppState>, MultipartForm(form): MultipartForm<UploadForm>) -> impl Responder {
  let mut model: tb_board::Model = form.json.into_inner();

  //   info!("board info {:?}", model);

  let ret = Mtn::save_form(&app.conn, form.file, &mut model).await;

  match ret {
    Ok(obj) => HttpResponse::Ok().json(obj),
    Err(e) => HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", e)),
  }
}
