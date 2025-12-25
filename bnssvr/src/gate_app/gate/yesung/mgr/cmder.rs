use crate::entities::tb_gate;
use crate::gate_app::gate;
use crate::gate_app::util::ws_send_gate_stat_all;
use crate::models::cd::{GateCmdRsltType, GateStatus};
use crate::GateCtx;
use log::debug;
use tokio_modbus::client::Context;

pub async fn mgr_get_status(
  ctx: &GateCtx,
  _addr: u16, // 사용 안 함
  modbus: &mut Context,
  model: &tb_gate::Model,
) -> (GateCmdRsltType, GateStatus, String) {
  // 3개 주소를 각각 읽기
  let remote_addr = super::super::util::get_read_remote_addr(&model.gate_no);
  let up_ok_addr = super::super::util::get_read_up_ok_addr(&model.gate_no);
  let down_ok_addr = super::super::util::get_read_down_ok_addr(&model.gate_no);

  let remote = gate::sock::do_read_input_registers(modbus, remote_addr, 1).await;

  if let Err(e) = remote {
    let msg = format!("[데몬] read_input_registers fail {e:?}");
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

  let up_ok = gate::sock::do_read_input_registers(modbus, up_ok_addr, 1).await;
  let down_ok = gate::sock::do_read_input_registers(modbus, down_ok_addr, 1).await;

  // 값 추출
  let remote_val = remote.unwrap().get(0).unwrap().clone();
  let up_ok_val = up_ok.unwrap_or(vec![0]).get(0).unwrap().clone();
  let down_ok_val = down_ok.unwrap_or(vec![0]).get(0).unwrap().clone();

  let (rslt, stat) = super::super::pkt::get_yesung_stat(remote_val, up_ok_val, down_ok_val);

  log::debug!(
    "[데몬] P00={} P08={} P09={} {}",
    remote_val,
    up_ok_val,
    down_ok_val,
    super::super::pkt::parse(remote_val, up_ok_val, down_ok_val).join(",")
  );

  (rslt, stat, "[데몬]".to_owned())
}

pub async fn mgr_do_stat(ctx: &GateCtx, model: &tb_gate::Model, modbus: &mut Context) {
  let (rslt, stat, msg) = mgr_get_status(ctx, 0, modbus, model).await;

  if rslt == GateCmdRsltType::Fail {
    return;
  }

  if model.gate_stat == Some(stat.to_string()) && model.cmd_rslt == Some(rslt.to_string()) {
    debug!("[데몬] 이미 상태가 동일함. {stat:?} {rslt:?}");
    return;
  }

  ws_send_gate_stat_all(&ctx, model.gate_seq, stat, rslt, msg.clone()).await;
}
