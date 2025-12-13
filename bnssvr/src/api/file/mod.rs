use crate::svc::comm::svc_file;
use crate::{models::WebCmd, svc::comm::svc_file::mtn::Mtn};
use actix_multipart::form::bytes::Bytes;
use actix_multipart::form::{json::Json as MpJson, MultipartForm};
use actix_web::http::header::ContentDisposition;
use actix_web::{get, post, web, HttpRequest, HttpResponse, Responder};
use log::{debug, info};
use qstring::QString;
use sea_orm::{Set, TryIntoModel};
use serde::Deserialize;

pub fn regist(config: &mut web::ServiceConfig) {
  config
      // file
      .service(save)
      .service(delete)
      //.service(download)
      .route("/api/file/download", web::get().to(download))
      .route("/api/public/file/download", web::get().to(download))
      .route("/api/file/download_nocache", web::get().to(download_nocache))
      .route("/api/public/file/download_nocache", web::get().to(download_nocache))
      .service(one)
      // end of regist
      ;
}

pub async fn download_nocache(app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  //let user = sess.get::<tb_login::Model>("login").unwrap();
  //HttpResponse::Ok().json(user)

  let qs = QString::from(req.query_string());
  let seq = qs.get("fileSeq").unwrap().parse::<i32>().unwrap();
  debug!("file download seq {:?}", seq);

  let ret = svc_file::qry::Qry::find_by_id(&app.conn, seq).await;
  match ret {
    Ok(l) => {
      let obj = l.unwrap();
      let cd = ContentDisposition::attachment(obj.file_nm.clone());
      let guess = mime_guess::from_path(&obj.file_nm);
      debug!("guess {:?}", guess);

      return HttpResponse::Ok()
        .append_header(cd)
        .content_type(guess.first_or_octet_stream())
        .append_header(("Cache-Control", "no-cache"))
        .append_header(("Pragma", "no-cache"))
        .append_header(("Expires", "0"))
        //.content_type("application/octet-stream")
        //.append_header(("Content-Disposition", format!("attachment; filename=\"{}\"", obj.file_nm)))
        .body(obj.file_data);
    }
    _ => return HttpResponse::NotFound().body("not found"),
  };
  //HttpResponse::Ok().json(obj)
}

pub async fn download(app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  //let user = sess.get::<tb_login::Model>("login").unwrap();
  //HttpResponse::Ok().json(user)

  let qs = QString::from(req.query_string());
  let seq = qs.get("fileSeq").unwrap().parse::<i32>().unwrap();
  debug!("file download seq {:?}", seq);

  let ret = svc_file::qry::Qry::find_by_id(&app.conn, seq).await;
  match ret {
    Ok(l) => {
      let obj = l.unwrap();
      let cd = ContentDisposition::attachment(obj.file_nm.clone());
      let guess = mime_guess::from_path(&obj.file_nm);
      debug!("guess {:?}", guess);

      return HttpResponse::Ok()
        .append_header(cd)
        .content_type(guess.first_or_octet_stream())
        //.content_type("application/octet-stream")
        //.append_header(("Content-Disposition", format!("attachment; filename=\"{}\"", obj.file_nm)))
        .body(obj.file_data);
    }
    _ => return HttpResponse::NotFound().body("not found"),
  };
  //HttpResponse::Ok().json(obj)
}

#[get("/api/file/one")]
pub async fn one(app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  //let user = sess.get::<tb_login::Model>("login").unwrap();
  //HttpResponse::Ok().json(user)

  let qs = QString::from(req.query_string());
  let seq = qs.get("fileSeq").unwrap().parse::<i32>().unwrap();
  debug!("file download seq {:?}", seq);

  let ret = svc_file::qry::Qry::find_info_by_id(&app.conn, seq).await;
  let obj = match ret {
    Ok(l) => l,
    _ => None,
  };
  HttpResponse::Ok().json(obj)
}

#[derive(Debug, Deserialize)]
struct Metadata {
  file_seq: Option<i32>,
}

#[derive(Debug, MultipartForm)]
#[allow(dead_code)]
struct UploadForm {
  #[multipart(limit = "20MB")]
  file: Bytes,
  json: MpJson<Metadata>,
}

#[post("/api/file/save")]
pub async fn save(app: web::Data<crate::AppState>, MultipartForm(form): MultipartForm<UploadForm>) -> impl Responder {
  info!("file save start {:?}", form);

  let ret = Mtn::save(&app.conn, form.json.file_seq, form.file).await;

  match ret {
    Ok(mut obj) => {
      obj.file_data = Set(vec![]); // clear file_data
      let model = obj.try_into_model().unwrap();

      HttpResponse::Ok().json(model)
    }
    Err(e) => HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", e)),
  }
  //HttpResponse::Ok().body("file save end")
}

#[post("/api/file/delete")]
pub async fn delete(app: web::Data<crate::AppState>, info: web::Json<serde_json::Value>) -> impl Responder {
  info!("file info {:?}", info);

  let seq = info.get("file_seq").unwrap().as_i64().unwrap() as i32;

  let ret = Mtn::delete(&app.conn, seq).await;

  match ret {
    Ok(obj) => HttpResponse::Ok().json(crate::models::WebRes {
      rslt: WebCmd::Ok,
      msg: format!("{:?}", obj),
    }),
    Err(e) => HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", e)),
  }
}
