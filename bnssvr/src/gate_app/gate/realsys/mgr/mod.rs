use crate::entities::tb_gate;
use crate::gate_app::gate::realsys::pkt;
use crate::gate_app::modbus;
use crate::gate_app::util::ws_send_gate_stat_all;
use crate::models::cd::{GateCmdRsltType, GateStatus};
use crate::GateCtx;
use log::debug;
use std::str::FromStr;
use tokio_modbus::prelude::*;

mod cmder;

pub async fn mgr_get_status(ctx: GateCtx, model: tb_gate::Model) {
  let seq = model.gate_seq;

  let modbus = modbus::conn::connect(&model.gate_ip, model.gate_port).await;

  let stat = GateStatus::from_str(model.gate_stat.clone().as_ref().unwrap_or(&"Na".to_owned())).unwrap_or(GateStatus::Na);

  if let Err(e) = modbus {
    let msg = format!("[데몬] 모드버스 연결실패 {e:?}");
    log::error!("{msg}");
    let rslt = GateCmdRsltType::Fail;

    if model.cmd_rslt == Some(rslt.to_string()) {
      debug!("[데몬] 이미 상태가 동일함. {stat:?} {rslt:?}");
      return;
    }

    ws_send_gate_stat_all(&ctx, model.gate_seq, stat, rslt, msg.clone()).await;
    return;
  }

  let mut modbus = modbus.unwrap();

  let addr = pkt::CMD_ADDR;
  let data = modbus.read_holding_registers(addr, 1).await;

  if let Err(e) = data {
    let msg = format!("[데몬] read_holding_registers fail {e:?}");
    log::error!("{msg}");
    let rslt = GateCmdRsltType::Fail;
    if model.cmd_rslt == Some(rslt.to_string()) {
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
    if model.cmd_rslt == Some(rslt.to_string()) {
      debug!("[데몬] 이미 상태가 동일함. {stat:?} {rslt:?}");
      return;
    }
    ws_send_gate_stat_all(&ctx, model.gate_seq, stat, rslt, msg.clone()).await;
    return;
  }
  let data = data.unwrap();

  debug!("[데몬] read data is {:?}", data);

  cmder::mgr_do_stat(&ctx, &model, &mut modbus).await;

  modbus.disconnect().await.unwrap_or_default();
  log::info!("[데몬] seq is {seq} 완료")
}
