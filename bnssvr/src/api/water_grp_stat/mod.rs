use crate::{
  water::{self, recv_worker::WaterRecvCmd},
  ws::{wsmodels::GrpAction, wssender},
};
use actix_web::{post, web, HttpResponse, Responder};

pub fn regist_route(config: &mut web::ServiceConfig) {
  config
    .service(control)
  // end of routes
  ;
}

async fn broadcast_action(water_grp_id: &str, action: GrpAction) {
  wssender::send_ws_water_grp_action(water_grp_id.to_string(), action).await;
}

#[post("/api/water_grp_stat/control")]
pub async fn control(_app: web::Data<crate::AppState>, info: web::Json<serde_json::Value>) -> impl Responder {
  log::info!("water_grp_stat control info {:?}", info);

  let water_grp_id = info.get("water_grp_id").unwrap().as_str().unwrap();
  let action = info.get("action").unwrap().as_str().unwrap(); // Autodown, Down, Stop, Close,
  let action = GrpAction::try_from(action).unwrap_or(GrpAction::Unknown);
  if action == GrpAction::Unknown {
    return HttpResponse::BadRequest().body("unknown action");
  }

  broadcast_action(water_grp_id, action).await;

  water::recv_worker::send(WaterRecvCmd::GrpAction(water_grp_id.to_string(), action)).await;

  HttpResponse::Ok().body("ok")

  //   let gate_seq = info.get("gate_seq").unwrap().as_i64().unwrap() as i32;
  //   let gate_cmd = info.get("gate_cmd").unwrap().as_str().unwrap();
  //   let msg = info.get("msg").and_then(|v| v.as_str()).map(|s| s.to_string());

  //   let cmd_type = GateCmdType::from_str(gate_cmd).unwrap();

  //   let (tx_api, mut rx_api) = tokio::sync::mpsc::channel::<Box<dyn IfGateCmdRes>>(1);

  //   let gate_cmd = GateCmd {
  //     gate_seq,
  //     cmd_type,
  //     tx_api: Some(tx_api),
  //     msg: msg,
  //   };

  //   app.tx_gate.send(Box::new(gate_cmd)).await.unwrap();

  //   let gate_cmd_res = rx_api.recv().await.unwrap();

  //   debug!("response gate cmd is {:?}", gate_cmd_res);

  //   // let ret = Mutation::save_gate(&app.conn, info.clone()).await;

  //   // match ret {
  //   //   Ok(obj) => HttpResponse::Ok().json(obj.try_into_model().unwrap()),
  //   //   Err(e) => HttpResponse::InternalServerError().body(format!("InternalServerError {:?}", e)),
  //   // }

  //   if let Some(res) = gate_cmd_res.downcast_ref::<GateCmdRes>() {
  //     return HttpResponse::Ok().json(res);
  //   }

  //   if let Some(res) = gate_cmd_res.downcast_ref::<GateCmdResItson>() {
  //     return HttpResponse::Ok().json(res);
  //   }

  //   if let Some(res) = gate_cmd_res.downcast_ref::<IfGateCmdResDoori>() {
  //     return HttpResponse::Ok().json(res);
  //   }

  // HttpResponse::InternalServerError().body("unknown gate cmd res")
}
