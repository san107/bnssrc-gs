use crate::entities::tb_gate;
use crate::gate_app::doori::pkt::DooriAutoMan;
use crate::gate_app::doori::pkt::DooriRemLoc;
use crate::gate_app::util::ws_send_gate_stat_all;
use crate::models::cd::{GateCmdRsltType, GateStatus};
use crate::GateCtx;
use log::debug;
use tokio_modbus::client::{Context, Reader};

pub async fn mgr_get_status(
  ctx: &GateCtx,
  addr: u16,
  modbus: &mut Context,
  model: &tb_gate::Model,
) -> (GateCmdRsltType, GateStatus, String) {
  //
  let data = modbus.read_coils(addr, 4).await;
  if let Err(e) = data {
    let msg = format!("[데몬] read_coils fail {e:?}");
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
  if let Err(e) = data {
    let msg = format!("[데몬] read_coils fail {e:?}");
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
  let stat = super::super::pkt::get_doori_stat(&data);
  log::debug!("[데몬] addr {} data {:?}", addr, data);

  let (_rslt, automan, remloc, _wind) = super::super::cmder::get_mode(modbus).await;
  if automan == DooriAutoMan::Auto && remloc == DooriRemLoc::Remote {
    // 원격제어 가능.
    return (GateCmdRsltType::Success, stat, "[데몬]".to_owned());
  }

  return (GateCmdRsltType::ModeErr, stat, "[데몬]".to_owned());
}

pub async fn mgr_do_stat(ctx: &GateCtx, model: &tb_gate::Model, modbus: &mut Context) {
  //
  let addr = super::pkt::CMD_ADDR_STAT;
  let (rslt, stat, msg) = mgr_get_status(ctx, addr, modbus, model).await;
  if rslt == GateCmdRsltType::Fail {
    return;
  }
  if model.gate_stat == Some(stat.to_string()) && model.cmd_rslt == Some(rslt.to_string()) {
    debug!("[데몬] 이미 상태가 동일함. {stat:?} {rslt:?}");
    return;
  }
  ws_send_gate_stat_all(&ctx, model.gate_seq, stat, rslt, msg.clone()).await;
}
