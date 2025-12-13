#![allow(unused)]
use crate::{
  ebrd::{cmds, pkt::pkt, pktsock},
  sock,
};
use actix_web::{get, web, HttpResponse, Responder};

pub fn regist_test(config: &mut web::ServiceConfig) {
  config
      // tests
      .service(t01)
      //  end of regist
      ;
}

#[get("/api/tests/ebrd/t01")]
pub async fn t01(data: web::Data<crate::AppState>) -> impl Responder {
  let mut stream = sock::conn::connect("127.0.0.1", 8080).await.unwrap();

  let mut pkt = pkt::Pkt::new();
  pkt.cmd = pkt::Cmd::Time;
  pkt.id = "000000000000".to_string();
  pkt.data = vec![];
  pkt.checksum = 0;

  let cmd = cmds::cmd_time::CmdTime::from_now();
  let bytes = cmd.to_bytes();
  pkt.data = bytes;

  let rstl = pktsock::send_pkt(&mut stream, &pkt).await;
  println!("rstl : {:?}", rstl);

  //pkt.etx = pkt::CtlChar::Etx;
  //   let json:serde_json::Value = serde_json::from_str(r#"
  //   {
  //     "code": 0,
  //     "message": "success",
  //     "data": {
  //       "id": 1,
  //       "name": "John Doe"
  //     }
  //   }
  //   "#).unwrap();
  //   HttpResponse::Ok().json(json)
  HttpResponse::Ok()
}
