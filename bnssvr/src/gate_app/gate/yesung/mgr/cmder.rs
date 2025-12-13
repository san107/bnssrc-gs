use crate::entities::tb_gate;
use crate::gate_app::gate;
use crate::gate_app::util::ws_send_gate_stat_all;
use crate::models::cd::{GateCmdRsltType, GateStatus};
use crate::GateCtx;
use log::debug;
use tokio_modbus::client::Context;

pub async fn mgr_get_status(
  ctx: &GateCtx,
  addr: u16,
  modbus: &mut Context,
  model: &tb_gate::Model,
) -> (GateCmdRsltType, GateStatus, String) {
  //
  let read_addr = super::super::util::get_read_addr(&model.gate_no);
  let data = gate::sock::do_read_input_registers(modbus, read_addr, 1).await;
  if let Err(e) = data {
    let msg = format!("[데몬] read_holding_registers fail {e:?}");
    log::error!("{msg}");
    let rslt = GateCmdRsltType::Fail;
    let stat = GateStatus::Na;
    if model.gate_stat == Some(stat.to_string()) && model.cmd_rslt == Some(rslt.to_string()) {
      debug!("[데몬] 이미 상태가 동일함. {stat:?} {rslt:?}");
      return (rslt, stat, msg);
    }
    ws_send_gate_stat_all(&ctx, model.gate_seq, stat, rslt, msg.clone()).await;
    return (rslt, stat, msg);
  }

  let data = data.unwrap();
  let data = data.get(0).unwrap().clone();
  let (rslt, stat) = super::super::pkt::get_yesung_stat(data);
  log::debug!("[데몬] addr {} flags {}", addr, super::super::pkt::parse(data).join(","));

  (rslt, stat, "[데몬]".to_owned())
}

pub async fn mgr_do_stat(ctx: &GateCtx, model: &tb_gate::Model, modbus: &mut Context) {
  //
  let read_addr = super::super::util::get_read_addr(&model.gate_no);
  let (rslt, stat, msg) = mgr_get_status(ctx, read_addr, modbus, model).await;
  if rslt == GateCmdRsltType::Fail {
    return;
  }
  if model.gate_stat == Some(stat.to_string()) && model.cmd_rslt == Some(rslt.to_string()) {
    debug!("[데몬] 이미 상태가 동일함. {stat:?} {rslt:?}");
    return;
  }
  ws_send_gate_stat_all(&ctx, model.gate_seq, stat, rslt, msg.clone()).await;
}
