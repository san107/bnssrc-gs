use lazy_static::lazy_static;
use serde::Serialize;
use serde_json::json;
use std::sync::Arc;
use tokio::sync::Mutex;

use crate::{
  models::cd::CommStat,
  ws::wsmodels::{GrpAction, GrpStat, WsCmd, WsMsg, WsWaterGrpAction, WsWaterGrpStat, WsWaterStat},
};

struct Ctx {
  tx_ws: Option<tokio::sync::broadcast::Sender<Box<String>>>,
}

lazy_static! {
  static ref CTX: Arc<Mutex<Ctx>> = Arc::from(Mutex::from(Ctx { tx_ws: None }));
}

pub async fn init(tx_ws: tokio::sync::broadcast::Sender<Box<String>>) {
  let mut ctx = CTX.lock().await;
  ctx.tx_ws = Some(tx_ws);
}

#[allow(dead_code)]
pub async fn send(wsmsg: String) {
  let ctx = CTX.lock().await;
  if let Some(tx) = ctx.tx_ws.as_ref() {
    if let Err(e) = tx.send(Box::from(wsmsg)) {
      log::error!("ws send error {:?}", e);
    }
  }
}

#[allow(dead_code)]
pub async fn send_ws_msg<T: Serialize>(wsmsg: WsMsg<T>) {
  let ctx = CTX.lock().await;
  if let Some(tx) = ctx.tx_ws.as_ref() {
    // T: Serialize 트레잇을 요구하도록 제네릭에 명시적으로 추가
    if let Err(e) = tx.send(Box::from(json!(wsmsg).to_string())) {
      log::error!("ws send error {:?}", e);
    }
  }
}

pub async fn send_ws_water_stat(water_seq: i32, comm_stat: CommStat) {
  let msg = WsMsg {
    cmd: WsCmd::WaterStat,
    data: WsWaterStat { water_seq, comm_stat },
  };
  send_ws_msg(msg).await;
}

pub async fn send_ws_water_grp_stat(water_grp_id: String, grp_stat: GrpStat) {
  let msg = WsMsg {
    cmd: WsCmd::WaterGrpStat,
    data: WsWaterGrpStat { water_grp_id, grp_stat },
  };
  send_ws_msg(msg).await;
}

pub async fn send_ws_water_grp_action(water_grp_id: String, grp_action: GrpAction) {
  let msg = WsMsg {
    cmd: WsCmd::WaterGrpAction,
    data: WsWaterGrpAction {
      water_grp_id,
      grp_action,
    },
  };
  send_ws_msg(msg).await;
}
