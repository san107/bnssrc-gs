use crate::entities::tb_gate;
use crate::gate_app::modbus;
use crate::gate_app::util::lock_read_holding_registers;
use crate::gate_app::util::vec_to_hex_u16;
use crate::gate_app::util::ws_send_gate_stat_all;
use crate::models::cd::{GateCmdRsltType, GateStatus};
use crate::GateCtx;
use log::debug;
use tokio_modbus::prelude::*;

mod cmder;
mod cmder_heartbeat;

pub async fn mgr_do_hearbeat(ctx: GateCtx, model: tb_gate::Model) {
  let seq = model.gate_seq;
  let ip = model.gate_ip.as_str();
  let port = model.gate_port;

  let modbbus = modbus::conn::connect(model.gate_ip.as_str(), model.gate_port).await;
  if let Err(e) = modbbus {
    let msg = format!("[데몬] 소켓 연결실패 {e:?} seq is {seq} {ip}:{port}");
    log::error!("{msg}");
    return;
  }

  let mut modbus = modbbus.unwrap();

  cmder_heartbeat::mgr_do_heartbeat(&ctx, &model, &mut modbus).await;

  modbus.disconnect().await.unwrap();
  log::info!("[데몬] seq is {seq} 완료");
}

pub async fn mgr_get_status(ctx: GateCtx, model: tb_gate::Model) {
  let seq = model.gate_seq;
  let ip = model.gate_ip.as_str();
  let port = model.gate_port;

  let modbbus = modbus::conn::connect(model.gate_ip.as_str(), model.gate_port).await;
  if let Err(e) = modbbus {
    let msg = format!("[데몬] 소켓 연결실패 {e:?} seq is {seq} {ip}:{port}");
    let rslt = GateCmdRsltType::Fail;
    let stat = GateStatus::Na;
    if model.gate_stat == Some(stat.to_string()) && model.cmd_rslt == Some(rslt.to_string()) {
      debug!("[데몬] 이미 상태가 동일함. {stat:?} {rslt:?}");
      return;
    }
    ws_send_gate_stat_all(&ctx, model.gate_seq, stat, rslt, msg.clone()).await;
    return;
  }

  let mut modbus = modbbus.unwrap();

  let gateidx = super::util::get_gate_idx(&model.gate_no);
  let addr = super::pkt::BASE_ADDR + gateidx * 2; // read, write address pair ==> * 2
  let data = lock_read_holding_registers(&model, &mut modbus, addr, 1).await;
  if let Err(e) = data {
    let msg = format!("[데몬] read_holding_registers fail {e:?}");
    log::error!("{msg}");
    let rslt = GateCmdRsltType::Fail;
    let stat = GateStatus::Na;
    if model.gate_stat == Some(stat.to_string()) && model.cmd_rslt == Some(rslt.to_string()) {
      debug!("[데몬] 이미 상태가 동일함. {stat:?} {rslt:?}");
      return;
    }
    ws_send_gate_stat_all(&ctx, model.gate_seq, stat, rslt, msg.clone()).await;
    return;
  }
  let data = data.unwrap();
  if let Err(e) = data {
    let msg = format!("[데몬] read_holding_registers fail {e:?}");
    log::error!("{msg}");
    let rslt = GateCmdRsltType::Fail;
    let stat = GateStatus::Na;
    if model.gate_stat == Some(stat.to_string()) && model.cmd_rslt == Some(rslt.to_string()) {
      debug!("[데몬] 이미 상태가 동일함. {stat:?} {rslt:?}");
      return;
    }
    ws_send_gate_stat_all(&ctx, model.gate_seq, stat, rslt, msg.clone()).await;
    return;
  }
  let data = data.unwrap();

  debug!("[데몬] read data is {:?} {}", data, vec_to_hex_u16(&data));
  if data.len() > 0 {
    log::debug!(
      "[데몬] addr {addr} {}",
      super::pkt::parse(data.get(0).unwrap().clone()).join(",")
    );
  }

  //crate::util::sleep(100).await; // 연결 후, 0.1초 delay.

  cmder::mgr_do_stat(&ctx, &model, &mut modbus).await;

  modbus.disconnect().await.unwrap();
  log::info!("[데몬] seq is {seq} 완료")
}
