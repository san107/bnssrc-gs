use crate::{
  entities::tb_login,
  gate_app::{GateCmd, GateCmdRes, GateCmdResItson, IfGateCmdRes, IfGateCmdResDoori},
  models::{cd::GateCmdType, WebCmd, WebRes},
  svc,
  ws::wsmodels::{WsCmd, WsMsg},
};
use actix_session::Session;
use actix_web::{get, post, web, HttpRequest, HttpResponse, Responder};
use log::{debug, info};
use qstring::QString;
use sea_orm::TryIntoModel;
use serde_json::json;
use std::str::FromStr;
use svc::gate::svc_gate::mtn::Mtn;

pub fn regist_route(config: &mut web::ServiceConfig) {
  config
    // gate
    .service(list)
    .service(grplist)
    .service(childlist)
    .service(one)
    .service(save)
    .service(update_disp_seqs)
    .service(searchlist)
    .service(grouplist)
    .service(notgrouplist)
    .service(delete)
    .service(control)
    // end of regist
    ;
}

#[get("/api/gate/one")]
pub async fn one(_sess: Session, app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  //let user = sess.get::<tb_login::Model>("login").unwrap();
  //HttpResponse::Ok().json(user)

  let qs = QString::from(req.query_string());
  let seq = qs.get("gateSeq").unwrap().parse::<i32>().unwrap();

  let ret = svc::gate::svc_gate::qry::Qry::find_by_id(&app.conn, seq).await;
  let obj = match ret {
    Ok(l) => l,
    _ => None,
  };
  HttpResponse::Ok().json(obj)
}

#[get("/api/gate/list")]
pub async fn list(_sess: Session, app: web::Data<crate::AppState>) -> impl Responder {
  //let user = sess.get::<tb_login::Model>("login").unwrap();
  //HttpResponse::Ok().json(user)
  let rlt = svc::gate::svc_gate::qry::Qry::find_all(&app.conn).await;
  let l = match rlt {
    Ok(l) => l,
    _ => vec![],
  };
  HttpResponse::Ok().json(l)
}

#[get("/api/gate/grplist")]
pub async fn grplist(_sess: Session, app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  let qs = QString::from(req.query_string());
  let grp_id = qs.get("grpId").unwrap().to_string();

  let rlt = svc::gate::svc_gate::qry::Qry::find_by_grp_id(&app.conn, grp_id).await;
  let l = match rlt {
    Ok(l) => l,
    Err(e) => {
      log::error!("e {e:?}");
      vec![]
    }
  };
  HttpResponse::Ok().json(l)
}

#[get("/api/gate/childlist")]
pub async fn childlist(_sess: Session, app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  //let user = sess.get::<tb_login::Model>("login").unwrap();
  //HttpResponse::Ok().json(user)
  let qs = QString::from(req.query_string());
  let id: String = qs.get("grpId").unwrap().into();

  let rlt = svc::gate::svc_gate::qry::Qry::find_by_childlist(&app.conn, &id).await;
  let l = match rlt {
    Ok(l) => l,
    _ => vec![],
  };

  HttpResponse::Ok().json(l)
}

#[post("/api/gate/update_disp_seqs")]
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

#[get("/api/gate/searchlist")]
pub async fn searchlist(_sess: Session, app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  let login = _sess.get::<tb_login::Model>("login").unwrap().unwrap();

  let qs = QString::from(req.query_string());
  let search = qs.get("gateNm").unwrap().to_string();
  let offset = 0;

  let rlt = svc::gate::svc_gate::qry::Qry::find_by_name(&app.conn, search, offset, None).await;
  let l = match rlt {
    Ok(l) => {
      if login.grp_id == "R001" {
        l
      } else {
        l.into_iter()
          .filter(|gate| gate.grp_id.contains(&login.grp_id))
          .collect::<Vec<_>>()
      }
    },
    _ => vec![],
  };
  HttpResponse::Ok().json(l)
}

#[get("/api/gate/grouplist")]
pub async fn grouplist(_sess: Session, app: web::Data<crate::AppState>, req: HttpRequest) -> impl Responder {
  //let user = sess.get::<tb_login::Model>("login").unwrap();
  //HttpResponse::Ok().json(user)
  let qs = QString::from(req.query_string());
  let seq = qs.get("grpSeq").unwrap().parse::<i32>().unwrap();

  let rlt = svc::gate::svc_gate::qry::Qry::find_by_withgrp(&app.conn, seq).await;
  let l = match rlt {
    Ok(l) => l,
    _ => vec![],
  };

  HttpResponse::Ok().json(l)
}

#[get("/api/gate/notgrouplist")]
pub async fn notgrouplist(_sess: Session, app: web::Data<crate::AppState>, _req: HttpRequest) -> impl Responder {
  let rlt = svc::gate::svc_gate::qry::Qry::find_by_withnotgrp(&app.conn).await;
  let l = match rlt {
    Ok(l) => l,
    _ => vec![],
  };

  HttpResponse::Ok().json(l)
}

#[post("/api/gate/save")]
pub async fn save(app: web::Data<crate::AppState>, info: web::Json<serde_json::Value>) -> impl Responder {
  info!("gate info {:?}", info);

  // gate_stat 의 경우에는, 저장하지 않음. 상태는 변경하지 않음.
  // let seq = info.get("gate_seq");
  // if let Some(seq) = seq {
  //   let model = svc::tb_gate::query::Query::find_by_id(&app.conn, seq.as_i64().unwrap() as i32).await;
  //   if let Ok(Some(model)) = model {
  //     if let Some(gate_stat) = model.gate_stat {
  //       info["gate_stat"] = json!(gate_stat);
  //     }
  //   }
  // }

  let ret = Mtn::save_gate(&app.conn, info.clone(), true).await;

  match ret {
    Ok(obj) => {
      let model = obj.try_into_model().unwrap();
      app
        .tx_ws
        .send(Box::from(
          json!(WsMsg {
            cmd: WsCmd::GateSave,
            data: model.clone(),
          })
          .to_string(),
        ))
        .unwrap();
      HttpResponse::Ok().json(model)
    }
    Err(e) => {
      let msg = format!("InternalServerError {:?}", e);
      log::error!("error : {msg}");
      HttpResponse::InternalServerError().body(msg)
    }
  }
}

#[post("/api/gate/delete")]
pub async fn delete(app: web::Data<crate::AppState>, info: web::Json<serde_json::Value>) -> impl Responder {
  info!("gate info {:?}", info);

  let gate_seq = info.get("gate_seq").unwrap().as_i64().unwrap() as i32;

  let ret = Mtn::delete_gate(&app.conn, gate_seq).await;

  match ret {
    Ok(obj) => {
      app
        .tx_ws
        .send(Box::from(
          json!(WsMsg {
            cmd: WsCmd::GateDel,
            data: gate_seq,
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

#[post("/api/gate/control")]
pub async fn control(app: web::Data<crate::AppState>, info: web::Json<serde_json::Value>) -> impl Responder {
  info!("gate info {:?}", info);

  let gate_seq = info.get("gate_seq").unwrap().as_i64().unwrap() as i32;
  let gate_cmd = info.get("gate_cmd").unwrap().as_str().unwrap();
  let msg = info.get("msg").and_then(|v| v.as_str()).map(|s| s.to_string());

  let cmd_type = GateCmdType::from_str(gate_cmd).unwrap();

  let (tx_api, mut rx_api) = tokio::sync::mpsc::channel::<Box<dyn IfGateCmdRes>>(1);

  let gate_cmd = GateCmd {
    gate_seq,
    cmd_type,
    tx_api: Some(tx_api),
    msg: msg,
  };

  app.tx_gate.send(Box::new(gate_cmd)).await.unwrap();

  let gate_cmd_res = rx_api.recv().await.unwrap();

  debug!("response gate cmd is {:?}", gate_cmd_res);

  // let ret = Mutation::save_gate(&app.conn, info.clone()).await;

  // match ret {
  //   Ok(obj) => HttpResponse::Ok().json(obj.try_into_model().unwrap()),
  //   Err(e) => HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", e)),
  // }

  if let Some(res) = gate_cmd_res.downcast_ref::<GateCmdRes>() {
    return HttpResponse::Ok().json(res);
  }

  if let Some(res) = gate_cmd_res.downcast_ref::<GateCmdResItson>() {
    return HttpResponse::Ok().json(res);
  }

  if let Some(res) = gate_cmd_res.downcast_ref::<IfGateCmdResDoori>() {
    return HttpResponse::Ok().json(res);
  }

  HttpResponse::InternalServerError().body("unknown gate cmd res")
}
