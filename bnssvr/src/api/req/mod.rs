use actix_web::{get, web, HttpRequest, HttpResponse, Responder};

pub fn regist_route(config: &mut web::ServiceConfig) {
  config
    .service(search)
    .service(address)
    // end of routes
    ;
}

#[get("/api/req/search")]
pub async fn search(req: HttpRequest) -> impl Responder {
  let client = reqwest::Client::builder().build().unwrap();

  //log::info!("query string : {}", req.query_string());
  let res = client
    .get(format!("https://api.vworld.kr/req/search?{}", req.query_string()))
    .send()
    .await;
  if let Err(e) = res {
    log::error!("E {e:?}");
    return HttpResponse::BadRequest().body(format!("{e:?}"));
  }

  let res = res.unwrap().bytes().await;
  if let Err(e) = res {
    log::error!("E {e:?}");
    return HttpResponse::BadRequest().body(format!("{e:?}"));
  }

  HttpResponse::Ok().body(res.unwrap())
}

#[get("/api/req/address")]
pub async fn address(req: HttpRequest) -> impl Responder {
  let client = reqwest::Client::builder().build().unwrap();

  //log::info!("query string : {}", req.query_string());
  let res = client
    .get(format!("https://api.vworld.kr/req/address?{}", req.query_string()))
    .send()
    .await;
  if let Err(e) = res {
    log::error!("E {e:?}");
    return HttpResponse::BadRequest().body(format!("{e:?}"));
  }

  let res = res.unwrap().bytes().await;
  if let Err(e) = res {
    log::error!("E {e:?}");
    return HttpResponse::BadRequest().body(format!("{e:?}"));
  }

  HttpResponse::Ok().body(res.unwrap())
}
