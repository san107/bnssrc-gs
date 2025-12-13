use crate::{
  entities::*,
  models::cd::{GateCmdRsltType, GateStatus},
  svc::{
    alm::svc_alm_sett,
    comm::svc_sms_solapi,
    gate::svc_gate,
    ndms::{svc_ndms_map_gate, svc_ndms_map_water},
    water::svc_water_gate,
  },
  water,
};
use actix_session::Session;
use actix_web::{get, web, HttpRequest, HttpResponse, Responder};
use bcrypt::{hash, DEFAULT_COST};
use cached::proc_macro::cached;
use log::{debug, info, warn};
use qstring::QString;
use sea_orm::TryIntoModel;

mod ebrd;

pub fn regist_route(config: &mut web::ServiceConfig) {
  config
    // tests
    .service(sess1)
    .service(update)
    .service(pass)
    .service(sess2)
    .service(sms1)
    .service(cache1)
    .service(sms)
    .service(sms2)
    .service(testget)
    .service(t01)
    .service(t03)
    .service(t04)
    //  end of regist
    ;
  ebrd::regist_test(config);
}

#[get("/api/tests/t04")]
pub async fn t04(_data: web::Data<crate::AppState>) -> impl Responder {
  log::info!("t04");
  water::recv_worker::send(water::recv_worker::WaterRecvCmd::Text("test".to_owned())).await;
  HttpResponse::Ok()
}

#[get("/api/tests/t03")]
pub async fn t03(data: web::Data<crate::AppState>) -> impl Responder {
  let list = svc_ndms_map_water::qry::Qry::find_by_water_dev_id(&data.conn, "DEV001").await;
  debug!("vec : {:?}", list.unwrap());
  HttpResponse::Ok()
}

#[get("/api/tests/t01")]
pub async fn t01(data: web::Data<crate::AppState>) -> impl Responder {
  let seq = 3;
  let list = svc_ndms_map_gate::qry::Qry::find_by_gate_seq(&data.conn, seq).await;
  debug!("vec : {:?}", list.unwrap());
  HttpResponse::Ok()
}

#[get("/api/tests/sess1")]
pub async fn sess1(sess: Session, _data: web::Data<crate::AppState>) -> impl Responder {
  let user = crate::entities::tb_login::Model {
    user_email: "email".to_owned(),
    user_id: "userid".to_owned(),
    user_name: "username".to_owned(),
    user_pass: "".to_owned(),
    user_role: "".to_owned(),
    grp_id: "R001".to_owned(),
  };

  sess.insert("login", user.clone()).unwrap();

  HttpResponse::Ok().json(user)
}

#[get("/api/tests/sess2")]
pub async fn sess2(sess: Session, _data: web::Data<crate::AppState>) -> impl Responder {
  let user = sess.get::<tb_login::Model>("login").unwrap();
  HttpResponse::Ok().json(user)
}

#[get("/api/tests/update")]
pub async fn update(_sess: Session, data: web::Data<crate::AppState>) -> impl Responder {
  //
  let rlt = svc_gate::mtn::Mtn::update_stat(&data.conn, 2, GateStatus::UpOk, GateCmdRsltType::Success).await;
  debug!("{:?}", rlt);
  HttpResponse::Ok()
}

#[get("/api/tests/pass")]
pub async fn pass(req: HttpRequest) -> impl Responder {
  let qs = QString::from(req.query_string());
  if let Some(p) = qs.get("p") {
    let hash = hash(p, DEFAULT_COST).unwrap();
    info!("pass {} hash {}", p, hash);
    return HttpResponse::Ok().body(hash);
  }

  HttpResponse::Ok().body("")
}

#[get("/api/tests/sms1")]
pub async fn sms1(data: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  if true {
    let qs = QString::from(req.query_string());
    if let Some(cmd) = qs.get("cmd") {
      if cmd == "send" {
        warn!("send sms");
        let mut msg = "test message";
        if let Some(m) = qs.get("msg") {
          warn!("send sms {}", m);
          msg = m;
        }
        let rlt = svc_sms_solapi::mtn::Mtn::send_sms2(&data.conn, "01071320397", "01094757661", msg).await;
        debug!("{:?}", rlt);
        if let Err(e) = rlt {
          return HttpResponse::InternalServerError().body(format!("{:?}", e));
        }
      }
    }
  } else {
    let qs = QString::from(req.query_string());
    if let Some(cmd) = qs.get("cmd") {
      if cmd == "send" {
        warn!("send sms");
        let mut msg = "test message";
        if let Some(m) = qs.get("msg") {
          warn!("send sms {}", m);
          msg = m;
        }
        let rlt = svc_sms_solapi::mtn::Mtn::send_sms(&data.conn, "01071320397", "01094757661", msg).await;
        debug!("{:?}", rlt);
        if let Err(e) = rlt {
          return HttpResponse::InternalServerError().body(format!("{:?}", e));
        }
        return HttpResponse::Ok().json(rlt.unwrap().try_into_model().unwrap());
      }
    }
  }

  HttpResponse::Ok().body("")
}

#[cached(time = 3600)]
fn fib(n: u64) -> u64 {
  if n == 0 || n == 1 {
    return n;
  }
  std::thread::sleep(std::time::Duration::from_millis(100));
  fib(n - 1) + fib(n - 2)
}

#[cached(time = 3600)]
fn test(n: u64) -> Result<u64, ()> {
  log::debug!("start sleep.. {n}");
  std::thread::sleep(std::time::Duration::from_millis(1000));
  log::debug!("end sleep..  {n}");
  Err(())
}

#[get("/api/tests/cache1")]
pub async fn cache1(req: HttpRequest) -> impl Responder {
  let qs = QString::from(req.query_string());
  if let Some(cmd) = qs.get("cmd") {
    log::debug!("cache1 cmd is {}", cmd);
    if let Err(_) = test(5) {
      // 에러인 경우, 캐시를 삭제하려면, 아래 주석해제.
      // TEST.lock().unwrap().cache_remove(&5);

      // 캐시 time 설정.
    }
    log::debug!("cache1 cmd is {}", fib(5));

    return HttpResponse::Ok().body(cmd.to_owned());
  }

  HttpResponse::Ok().body("")
}

#[get("/api/tests/sms")]
pub async fn sms(app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  let qs = QString::from(req.query_string());
  if let None = qs.get("cmd") {
    return HttpResponse::Ok().body("cmd is none");
  }
  let cmd = qs.get("cmd");
  if cmd.is_none() {
    return HttpResponse::Ok().body("cmd is none");
  }
  let cmd = cmd.unwrap();

  log::info!("cmd is {cmd}");
  if cmd == "a" {
    let ret = svc_alm_sett::qry::Qry::find_by_water(&app.conn, 1).await;
    if let Err(e) = ret {
      return HttpResponse::Ok().body(format!("{e:?}"));
    }
    let ret = ret.unwrap();

    log::debug!("ret is {ret:#?}");

    return HttpResponse::Ok().body(format!("{ret:?}"));
  }

  return HttpResponse::Ok().body(cmd.to_owned());
}

#[get("/api/tests/sms2")]
pub async fn sms2(data: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  let qs = QString::from(req.query_string());
  let cmd = qs.get("cmd");
  let from = qs.get("from");
  let to = qs.get("to");

  if cmd.is_none() {
    return HttpResponse::Ok().body("cmd is none");
  }
  if from.is_none() {
    return HttpResponse::Ok().body("from is none");
  }
  if to.is_none() {
    return HttpResponse::Ok().body("to is none");
  }

  if let Some(cmd) = qs.get("cmd") {
    if cmd == "send" {
      let mut msg = "";
      if let Some(m) = qs.get("msg") {
        msg = m;
      }
      let rlt = svc_sms_solapi::mtn::Mtn::send_sms(&data.conn, from.unwrap(), to.unwrap(), msg).await;
      debug!("{:?}", rlt);
      if let Err(e) = rlt {
        return HttpResponse::InternalServerError().body(format!("{:?}", e));
      }
      return HttpResponse::Ok().json(rlt.unwrap().try_into_model().unwrap());
    }
  }

  HttpResponse::Ok().body("")
}

#[get("/api/tests/test")]
pub async fn testget(app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  let qs = QString::from(req.query_string());
  if let None = qs.get("cmd") {
    return HttpResponse::Ok().body("cmd is none");
  }
  let cmd = qs.get("cmd");
  if cmd.is_none() {
    return HttpResponse::Ok().body("cmd is none");
  }
  let cmd = cmd.unwrap();

  log::info!("cmd is {cmd}");
  if cmd == "a" {
    //
    let seq = 1;
    let res = svc_water_gate::qry::Qry::find_gate_by_water(&app.conn, seq).await;
    log::debug!("res is {res:?}");
  } else {
    log::error!("unknown cmd is {cmd}");
  }

  return HttpResponse::Ok().body(cmd.to_owned());
}
