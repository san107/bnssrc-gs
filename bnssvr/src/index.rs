use actix_files::NamedFile;
use actix_web::{
  http::{Method, StatusCode},
  Either, HttpResponse, Responder, Result,
};

pub async fn default_handler(req_method: Method) -> Result<impl Responder> {
  match req_method {
    Method::GET => {
      let file = NamedFile::open("static/404.html")?
        .customize()
        .with_status(StatusCode::NOT_FOUND);
      Ok(Either::Left(file))
    }
    _ => Ok(Either::Right(HttpResponse::MethodNotAllowed().finish())),
  }
}
