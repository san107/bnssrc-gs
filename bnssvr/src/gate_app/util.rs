use crate::{
  entities::tb_gate,
  gate_app::gate::cmd_lock,
  models::cd::{ElockStatus, GateCmdRsltType, GateCmdType, GateStatus},
  ndms::ndms_app::ndms_send_gate_detail,
  svc::gate::{svc_gate, svc_gate_hist},
  ws::wsmodels::{WsCmd, WsGateStat, WsMsg},
  GateCtx,
};
use sea_orm::DatabaseConnection;
use std::str::FromStr;
use tokio::{io::AsyncWriteExt, net::TcpStream, sync::broadcast};
use tokio_modbus::client::{Context, Reader, Writer};

use super::{GateCmd, GateCmdRes, GateCmdResItson, IfGateCmdRes};

#[allow(dead_code)]
pub async fn send_cmd_res_if(cmd: &GateCmd, res: Box<dyn IfGateCmdRes>) {
  if cmd.tx_api.is_none() {
    return;
  }
  let _ = cmd.tx_api.as_ref().unwrap().send(res).await;
}

pub async fn send_cmd_res(cmd: &GateCmd, rslt: GateCmdRsltType, stat: GateStatus, msg: String) {
  if cmd.tx_api.is_none() {
    return;
  }
  let _ = cmd
    .tx_api
    .as_ref()
    .unwrap()
    .send(Box::from(GateCmdRes {
      cmd_res: rslt,
      cmd_res_msg: msg,
      gate_status: stat,
    }))
    .await;
}

pub async fn send_cmd_res_itson(cmd: &GateCmd, rslt: GateCmdRsltType, stat: GateStatus, elock: ElockStatus, msg: String) {
  if cmd.tx_api.is_none() {
    return;
  }
  let _ = cmd
    .tx_api
    .as_ref()
    .unwrap()
    .send(Box::from(GateCmdResItson {
      cmd_res: rslt,
      cmd_res_msg: msg,
      gate_status: stat,
      elock_status: elock,
    }))
    .await;
}

/**
 * DB업데이트 후, 웹소켓 전송이 맞는듯.
 */
pub async fn send_cmd_res_all(ctx: &GateCtx, cmd: &GateCmd, rslt: GateCmdRsltType, stat: GateStatus, msg: String) {
  do_gate_stat_changed(ctx, cmd, rslt, stat, msg.clone()).await;
  // API 요청에 대한 응답.
  send_cmd_res(&cmd, rslt, stat, msg.clone()).await;
}

pub async fn do_gate_stat_changed(ctx: &GateCtx, cmd: &GateCmd, rslt: GateCmdRsltType, stat: GateStatus, msg: String) {
  // gate상태, cmd_rslt 업데이트함.
  svc_gate::mtn::Mtn::update_stat_ignr_rslt(&ctx.conn, cmd.gate_seq, stat, rslt).await;
  // 히스토리 저장.
  svc_gate_hist::mtn::Mtn::save_stat_ignr_rslt(&ctx.conn, cmd.gate_seq, stat, cmd.cmd_type, rslt, Some(msg.clone())).await;
  // 게이트 상태 변화 웹소켓으로 전송. ndms 로도 전송함.
  ws_send_gate_stat(&ctx.tx_ws, cmd.gate_seq, stat, rslt, msg.clone()).await;
}

pub async fn send_cmd_res_changed(
  ctx: &GateCtx,
  model: &tb_gate::Model,
  cmd: &GateCmd,
  rslt: GateCmdRsltType,
  stat: GateStatus,
  msg: String,
) {
  let is_changed = model.gate_stat != Some(stat.to_string()) || model.cmd_rslt != Some(rslt.to_string());
  if is_changed {
    do_gate_stat_changed(ctx, cmd, rslt, stat, msg.clone()).await;
  }
  // API 요청에 대한 응답.
  send_cmd_res(&cmd, rslt, stat, msg.clone()).await;
}

// /**
//  * 조건에 따라서 처리함.
//  * 1. 상태를 확인하여, 변경사항이 없으면, 응답(send_cmd_res)만 처리한다.
//  * 2. 상태를 확인하여, 변경사항이 있으면, 모든 것을 처리한다.
//  */
// pub async fn send_cmd_res_by_cond(ctx: &GateCtx, cmd: &GateCmd, rslt: GateCmdRsltType, stat: GateStatus, msg: String) {
//   // gate상태, cmd_rslt 업데이트함.
//   svc_gate::mtn::Mtn::update_stat_ignr_rslt(&ctx.conn, cmd.gate_seq, stat, rslt).await;
//   // 히스토리 저장.
//   svc_gate_hist::mtn::Mtn::save_stat_ignr_rslt(&ctx.conn, cmd.gate_seq, stat, cmd.cmd_type, rslt, Some(msg.clone())).await;
//   // API 요청에 대한 응답.
//   send_cmd_res(&cmd, rslt, stat, msg.clone()).await;
//   // 게이트 상태 변화 웹소켓으로 전송. ndms 로도 전송함.
//   ws_send_gate_stat(&ctx.tx_ws, cmd.gate_seq, stat, rslt, msg.clone()).await;
// }

#[allow(dead_code)]
pub async fn send_cmd_res_with_ws(ctx: &GateCtx, cmd: &GateCmd, rslt: GateCmdRsltType, stat: GateStatus, msg: String) {
  send_cmd_res(&cmd, rslt, stat, msg.clone()).await;
  ws_send_gate_stat(&ctx.tx_ws, cmd.gate_seq, stat, rslt, msg.clone()).await;
}

pub async fn stream_write_all(ctx: &GateCtx, stream: &mut TcpStream, sbytes: &Vec<u8>, cmd: &GateCmd) -> bool {
  if let Err(e) = stream.write(sbytes).await {
    let rslt = GateCmdRsltType::Fail;
    let stat = GateStatus::Na;
    let msg = format!("소켓 fail {e:?}");
    send_cmd_res_all(&ctx, &cmd, rslt, stat, msg).await;
    return false;
  }
  true
}

pub async fn ws_send_gate_stat_all(ctx: &GateCtx, gate_seq: i32, stat: GateStatus, rslt: GateCmdRsltType, msg: String) {
  svc_gate::mtn::Mtn::update_stat_ignr_rslt(&ctx.conn, gate_seq, stat, rslt).await;
  let req = GateCmdType::Stat;
  svc_gate_hist::mtn::Mtn::save_stat_ignr_rslt(&ctx.conn, gate_seq, stat, req, rslt, Some(msg.clone())).await;
  ws_send_gate_stat(&ctx.tx_ws, gate_seq, stat, rslt, msg.clone()).await;
}

/*
gate 상태 변화시 필수적으로 호출해주어야 하는 함수임.
*/
pub async fn ws_send_gate_stat(
  tx_ws: &broadcast::Sender<Box<String>>,
  gate_seq: i32,
  stat: GateStatus,
  rslt: GateCmdRsltType,
  msg: String,
) {
  _ = ndms_send_gate_detail(gate_seq, stat, rslt).await;
  let _ = tx_ws.send(Box::from(
    serde_json::to_string(&WsMsg {
      cmd: WsCmd::GateStat,
      data: WsGateStat {
        gate_seq: gate_seq,
        gate_stat: stat,
        cmd_rslt: rslt,
        msg: msg.clone().into(),
      },
    })
    .unwrap_or("{}".to_owned()),
  ));
}

pub fn vec_to_hex(v: &[u8]) -> String {
  v.iter().map(|e| format!("{:02x}", e)).collect::<Vec<String>>().join(" ")
}

pub fn vec_to_hex_u16(v: &[u16]) -> String {
  v.iter().map(|e| format!("{:04x}", e)).collect::<Vec<String>>().join(" ")
}

#[allow(dead_code)]
pub fn vec_to_bin_u16(v: &[u16]) -> String {
  v.iter().map(|e| format!("{:016b}", e)).collect::<Vec<String>>().join(" ")
}

#[allow(dead_code)]
pub fn get_gate_status(stat: Option<String>) -> Option<GateStatus> {
  if stat.is_none() {
    return None;
  }

  let stat = stat.unwrap();

  let rslt = GateStatus::from_str(&stat);
  match rslt {
    Ok(s) => Some(s),
    Err(e) => {
      log::error!("[GATE] parse error {e:?}");
      None
    }
  }
}

#[allow(dead_code)]
pub fn get_gate_rslt(stat: Option<String>) -> Option<GateCmdRsltType> {
  if stat.is_none() {
    return None;
  }

  let stat = stat.unwrap();

  let rslt = GateCmdRsltType::from_str(&stat);
  match rslt {
    Ok(s) => Some(s),
    Err(e) => {
      log::error!("[GATE] parse error {e:?}");
      None
    }
  }
}

#[allow(dead_code)]
pub async fn is_same_gate_stat(ctx: &GateCtx, model: &tb_gate::Model, rslt: GateCmdRsltType, stat: GateStatus) -> bool {
  let seq = model.gate_seq;
  let model = svc_gate::qry::Qry::find_by_id(&ctx.conn, seq).await;
  if let Err(e) = model {
    log::error!("[GATE] can not find model seq is {seq} e {e:?}");
    return true;
  }
  let model = model.unwrap();
  if model.is_none() {
    log::error!("[GATE] can not find model seq is {seq}");
    return true;
  }
  let model = model.unwrap();
  if model.gate_stat == Some(stat.to_string()) && model.cmd_rslt == Some(rslt.to_string()) {
    return true;
  }
  false
}

pub async fn get_gate_model(db: &DatabaseConnection, seq: i32) -> Option<tb_gate::Model> {
  let model = svc_gate::qry::Qry::find_by_id(db, seq).await;
  if let Err(e) = model {
    log::error!("[GATE] can not find model seq is {seq} e {e:?}");
    return None;
  }
  model.unwrap()
}

pub fn get_sock_addr(model: &tb_gate::Model) -> String {
  format!("{}:{}", model.gate_ip, model.gate_port)
}

pub const PLUS_SLEEP: u64 = 1100;

pub async fn lock_read_holding_registers(
  model: &tb_gate::Model,
  modbus: &mut Context,
  addr: u16,
  count: u16,
) -> tokio_modbus::Result<Vec<u16>> {
  let _lock = cmd_lock::mutex(&get_sock_addr(&model)).await;
  modbus.read_holding_registers(addr, count).await
}

pub async fn lock_write_single_register(
  model: &tb_gate::Model,
  modbus: &mut Context,
  addr: u16,
  data: u16,
) -> tokio_modbus::Result<()> {
  let _lock = cmd_lock::mutex(&get_sock_addr(&model)).await;
  modbus.write_single_register(addr, data).await
}
