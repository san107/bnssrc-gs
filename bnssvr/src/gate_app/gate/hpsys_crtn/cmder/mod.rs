use super::pkt;
use crate::{
  entities::tb_gate,
  fln,
  gate_app::{
    util::{lock_read_holding_registers, send_cmd_res, send_cmd_res_all, send_cmd_res_changed},
    GateCmd,
  },
  models::cd::{DoGateCmdRslt, GateCmdRsltType, GateCmdType, GateStatus},
  GateCtx,
};
use tokio_modbus::client::Context;

mod cmd_autodown;
mod cmd_down;
mod cmd_down_async;
mod cmd_stat;
mod cmd_stop_async;
mod cmd_up;
mod cmd_up_async;
/**
 * 상태가져오기.
 */
pub async fn get_status(
  ctx: &GateCtx,
  addr: u16,
  modbus: &mut Context,
  cmd: &GateCmd,
  model: &tb_gate::Model,
) -> (GateCmdRsltType, GateStatus, String) {
  //
  let data = lock_read_holding_registers(&model, modbus, addr, 1).await;
  let cmdmsg = cmd.msg.clone().unwrap_or("".to_owned());
  if let Err(e) = data {
    let msg = format!("[HPCRTN] read_holding_registers fail {e:?}{cmdmsg}");
    log::error!("{msg}");
    let rslt = GateCmdRsltType::Fail;
    let stat = GateStatus::Na;
    send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
    return (rslt, stat, msg);
  }
  let data = data.unwrap();
  if let Err(e) = data {
    let msg = format!("[HPCRTN] read_holding_registers fail {e:?}{cmdmsg}");
    log::error!("{msg}");
    let rslt = GateCmdRsltType::Fail;
    let stat = GateStatus::Na;
    send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
    return (rslt, stat, msg);
  }
  let data = data.unwrap();
  let data = data.get(0).unwrap().clone();
  let stat = pkt::get_hpsys_crtn_stat(data);
  let stat_str = pkt::get_hpsys_crtn_stat_str(data);
  log::debug!("[HPCRTN] addr {} val {} flags {}  {cmdmsg}", addr, data, stat_str);

  let rslt = if pkt::get_hpsys_crtn_is_remote(data) {
    GateCmdRsltType::Success
  } else {
    GateCmdRsltType::ModeErr
  };

  (rslt, stat, stat_str)
}

pub async fn get_status_changed(
  ctx: &GateCtx,
  addr: u16,
  modbus: &mut Context,
  model: &tb_gate::Model,
  cmd: &GateCmd,
) -> (GateCmdRsltType, GateStatus, String) {
  //
  let data = lock_read_holding_registers(&model, modbus, addr, 1).await;
  let cmdmsg = cmd.msg.clone().unwrap_or("".to_owned());
  if let Err(e) = data {
    let msg = format!("[HPCRTN] read_holding_registers fail {e:?}{cmdmsg}");
    log::error!("{msg}");
    let rslt = GateCmdRsltType::Fail;
    let stat = GateStatus::Na;
    send_cmd_res_changed(&ctx, model, &cmd, rslt, stat, msg.clone()).await;
    return (rslt, stat, msg);
  }
  let data = data.unwrap();
  if let Err(e) = data {
    let msg = format!("[HPCRTN] read_holding_registers fail {e:?}{cmdmsg}");
    log::error!("{msg}");
    let rslt = GateCmdRsltType::Fail;
    let stat = GateStatus::Na;
    send_cmd_res_changed(&ctx, model, &cmd, rslt, stat, msg.clone()).await;
    return (rslt, stat, msg);
  }
  let data = data.unwrap();
  let data = data.get(0).unwrap().clone();
  let stat = pkt::get_hpsys_crtn_stat(data);
  let stat_str = pkt::get_hpsys_crtn_stat_str(data);
  log::debug!("[HPCRTN] addr {} val {} flags {}  {cmdmsg}", addr, data, stat_str);

  let rslt = if pkt::get_hpsys_crtn_is_remote(data) {
    GateCmdRsltType::Success
  } else {
    GateCmdRsltType::ModeErr
  };

  (rslt, stat, stat_str)
}

pub async fn do_cmd(ctx: &GateCtx, model: &tb_gate::Model, modbus: &mut Context, cmd: &GateCmd) -> anyhow::Result<DoGateCmdRslt> {
  if cmd.cmd_type == GateCmdType::Down {
    return cmd_down::do_cmd_down(ctx, model, modbus, cmd).await;
  } else if cmd.cmd_type == GateCmdType::DownAsync {
    return cmd_down_async::do_cmd_down_async(ctx, model, modbus, cmd).await;
  } else if cmd.cmd_type == GateCmdType::AutoDown {
    return cmd_autodown::do_cmd_autodown(ctx, model, modbus, cmd).await;
  } else if cmd.cmd_type == GateCmdType::Up {
    return cmd_up::do_cmd_up(ctx, model, modbus, cmd).await;
  } else if cmd.cmd_type == GateCmdType::UpAsync {
    return cmd_up_async::do_cmd_up_async(ctx, model, modbus, cmd).await;
  } else if cmd.cmd_type == GateCmdType::Stop {
    return cmd_stop_async::do_cmd_stop_async(ctx, model, modbus, cmd).await;
  } else if cmd.cmd_type == GateCmdType::Stat {
    return cmd_stat::do_cmd_stat(ctx, model, modbus, cmd).await;
  }

  let msg = format!("[HPCRTN] Not Supported Cmd {:?}", cmd.cmd_type);
  send_cmd_res(&cmd, GateCmdRsltType::Fail, GateStatus::Na, msg.clone()).await;

  Err(anyhow::anyhow!(fln!(msg)))
}
