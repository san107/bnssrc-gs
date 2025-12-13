use crate::entities::{tb_ebrd_msg, tb_login};
use crate::{models::WebCmd, svc::ebrd::svc_ebrd_msg};
use actix_multipart::form::bytes::Bytes;
use actix_multipart::form::{json::Json as MpJson, MultipartForm};
use actix_session::Session;
use actix_web::{get, post, web, HttpRequest, HttpResponse, Responder};
use chrono::Local;
use qstring::QString;
use sea_orm::TryIntoModel;
use serde::Deserialize;

pub fn regist_route(config: &mut web::ServiceConfig) {
  config
    .service(get_list)
    .service(get_one)
    .service(save_form)
    .service(save)
    .service(delete)
    .service(get_page)
    .service(get_emerlist)
    // end of routes
    ;
}

#[get("/api/ebrd_msg/page")]
pub async fn get_page(app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  let qs = QString::from(req.query_string());
  let page = qs.get("page").unwrap().parse::<u64>().unwrap();
  let ebrd_seq = qs.get("ebrd_seq").unwrap().parse::<i32>().unwrap();

  let ret = svc_ebrd_msg::qry::Qry::find_all(&app.conn, ebrd_seq, false, Some(page)).await;
  let obj = match ret {
    Ok(l) => l,
    _ => vec![],
  };
  HttpResponse::Ok().json(obj)
}

#[get("/api/ebrd_msg/emerlist")]
pub async fn get_emerlist(app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  let qs = QString::from(req.query_string());
  let ebrd_seq = qs.get("ebrd_seq").unwrap().parse::<i32>().unwrap();

  let ret = svc_ebrd_msg::qry::Qry::find_emerlist(&app.conn, ebrd_seq).await;
  let obj = match ret {
    Ok(l) => l,
    _ => vec![],
  };
  HttpResponse::Ok().json(obj)
}

#[get("/api/ebrd_msg/list")]
pub async fn get_list(app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  let qs = QString::from(req.query_string());
  let ebrd_seq = qs.get("ebrd_seq").unwrap().parse::<i32>().unwrap();
  let running = qs.get("running");
  let running = if running.is_some() {
    running.unwrap().parse::<i32>().unwrap() > 0
  } else {
    false
  };
  let ret = svc_ebrd_msg::qry::Qry::find_all(&app.conn, ebrd_seq, running, None).await;
  let obj = match ret {
    Ok(l) => l,
    _ => vec![],
  };
  HttpResponse::Ok().json(obj)
}

#[get("/api/ebrd_msg/one")]
pub async fn get_one(app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  let qs = QString::from(req.query_string());
  let seq = qs.get("ebrd_msg_seq").unwrap().parse::<i32>().unwrap();

  let ret = svc_ebrd_msg::qry::Qry::find_by_id(&app.conn, seq).await;
  let obj = match ret {
    Ok(l) => l,
    _ => None,
  };
  HttpResponse::Ok().json(obj)
}
/*


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

*/

#[derive(Debug, Deserialize)]
pub struct MetaEbrdMsg {
  pub ebrd_seqs: Vec<i32>,
}

#[derive(Debug, MultipartForm)]
#[allow(dead_code)]
struct UploadForm {
  #[multipart(limit = "20MB")]
  file: Option<Bytes>,
  json: MpJson<tb_ebrd_msg::Model>,
  meta: MpJson<MetaEbrdMsg>,
}

#[post("/api/ebrd_msg/save_form")]
pub async fn save_form(
  sess: Session,
  app: web::Data<crate::AppState>,
  MultipartForm(form): MultipartForm<UploadForm>,
) -> impl Responder {
  let user = sess.get::<tb_login::Model>("login").unwrap().unwrap();
  //log::info!("save_form start {:?}", form);
  // log::info!("json {:?}", form.json);
  // //log::info!("file {:?}", form.file);
  // log::info!("meta {:?}", form.meta);
  let mut model: tb_ebrd_msg::Model = form.json.into_inner();
  let meta = form.meta.into_inner();
  // log::info!("model {:?}", model);
  // log::info!("meta {:?}", meta);

  // 만약 파일이 없는데, file_seq 도 없으면 에러임.
  if form.file.is_none() && model.file_seq < 0 {
    return HttpResponse::InternalServerError().body("file_seq is required");
  }

  model.update_dt = Local::now().naive_local();
  model.update_user_id = user.user_id.clone();

  let ret = svc_ebrd_msg::mtn::Mtn::save_form(&app.conn, form.file, &mut model, meta).await;

  match ret {
    Ok(obj) => HttpResponse::Ok().json(obj),
    Err(e) => HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", e)),
  }
}

#[post("/api/ebrd_msg/save")]
pub async fn save(app: web::Data<crate::AppState>, data: web::Json<serde_json::Value>) -> impl Responder {
  let ret = svc_ebrd_msg::mtn::Mtn::save(&app.conn, data.into_inner()).await;

  match ret {
    Ok(obj) => HttpResponse::Ok().json(obj.try_into_model().unwrap()),
    Err(e) => HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", e)),
  }
}

#[post("/api/ebrd_msg/delete")]
pub async fn delete(app: web::Data<crate::AppState>, data: web::Json<serde_json::Value>) -> impl Responder {
  let seq = data.get("ebrd_msg_seq").unwrap().as_i64().unwrap() as i32;
  let ret = svc_ebrd_msg::mtn::Mtn::delete(&app.conn, seq).await;
  match ret {
    Ok(obj) => HttpResponse::Ok().json(crate::models::WebRes {
      rslt: WebCmd::Ok,
      msg: format!("{:?}", obj),
    }),
    Err(e) => HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", e)),
  }
}
