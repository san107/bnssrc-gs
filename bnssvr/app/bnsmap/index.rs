use actix_files::NamedFile;
use actix_web::{
  http::{Method, StatusCode},
  Either, HttpResponse, Responder, Result,
};
//use serde::Deserialize;

// #[derive(Debug, Deserialize)]
// pub struct Params {
//   #[allow(dead_code)]
//   page: Option<u64>,
//   posts_per_page: Option<u64>,
// }

// #[get("/")]
// pub async fn index(req: HttpRequest, data: web::Data<crate::AppState>) -> Result<HttpResponse, Error> {
//   //let template = &data.templates;

//   let mut ctx = tera::Context::new();

//   let params = web::Query::<Params>::from_query(req.query_string()).unwrap();

//   let posts_per_page = params.posts_per_page.unwrap_or(10);
//   ctx.insert("posts_per_page", &posts_per_page);

//   let body = template
//     .render("index.html.tera", &ctx)
//     .map_err(|_| actix_web::error::ErrorInternalServerError("Template error"))?;
//   Ok(HttpResponse::Ok().content_type("text/html").body(body))
// }

// pub fn p404(req: actix_web::HttpRequest) -> Result<actix_web::HttpResponse, actix_web::Error> {
//   println!("{:?}lll", req);
//   Ok(
//     actix_web::HttpResponse::NotFound()
//       .content_type("text/plain")
//       .body("Not Found"),
//   )
// }

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
