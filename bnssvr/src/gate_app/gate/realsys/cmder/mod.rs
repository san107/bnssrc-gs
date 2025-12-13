use std::str::FromStr;

use super::pkt::{self};
use crate::{
  entities::tb_gate,
  fln,
  gate_app::{
    util::{send_cmd_res, send_cmd_res_changed},
    GateCmd,
  },
  models::cd::{DoGateCmdRslt, GateCmdRsltType, GateCmdType, GateStatus},
  GateCtx,
};
use tokio_modbus::client::{Context, Reader};

mod cmd_autodown;
mod cmd_down;
mod cmd_stat;
mod cmd_up;

pub async fn get_status_changed(
  ctx: &GateCtx,
  modbus: &mut Context,
  model: &tb_gate::Model,
  cmd: &GateCmd,
) -> (GateCmdRsltType, GateStatus, String) {
  let addr = pkt::CMD_ADDR;
  let data = modbus.read_holding_registers(addr, 1).await;
  let cmdmsg = cmd.msg.clone().unwrap_or("".to_owned());
  let stat = GateStatus::from_str(model.gate_stat.clone().as_ref().unwrap_or(&"Na".to_owned())).unwrap_or(GateStatus::Na);
  if let Err(e) = data {
    let msg = format!("[REALSYS] read_holding_registers fail {e:?}{cmdmsg}");
    log::error!("{msg}");
    let rslt = GateCmdRsltType::Fail;
    send_cmd_res_changed(&ctx, model, &cmd, rslt, stat, msg.clone()).await;
    return (rslt, stat, msg);
  }
  let data = data.unwrap();
  if let Err(e) = data {
    let msg = format!("[REALSYS] read_holding_registers fail {e:?}{cmdmsg}");
    log::error!("{msg}");
    let rslt = GateCmdRsltType::Fail;
    send_cmd_res_changed(&ctx, model, &cmd, rslt, stat, msg.clone()).await;
    return (rslt, stat, msg);
  }
  let data = data.unwrap();
  log::debug!("[REALSYS] addr {} val {:?}  {cmdmsg}", addr, data,);

  return (GateCmdRsltType::Success, stat, "".to_owned());
}

pub async fn do_cmd(ctx: &GateCtx, model: &tb_gate::Model, modbus: &mut Context, cmd: &GateCmd) -> anyhow::Result<DoGateCmdRslt> {
  if cmd.cmd_type == GateCmdType::Down {
    return cmd_down::do_cmd_down(ctx, model, modbus, cmd).await;
  } else if cmd.cmd_type == GateCmdType::DownAsync {
    return cmd_down::do_cmd_down(ctx, model, modbus, cmd).await;
  } else if cmd.cmd_type == GateCmdType::AutoDown {
    return cmd_autodown::do_cmd_autodown(ctx, model, modbus, cmd).await;
  } else if cmd.cmd_type == GateCmdType::Up {
    return cmd_up::do_cmd_up(ctx, model, modbus, cmd).await;
  } else if cmd.cmd_type == GateCmdType::UpAsync {
    return cmd_up::do_cmd_up(ctx, model, modbus, cmd).await;
  } else if cmd.cmd_type == GateCmdType::Stat {
    return cmd_stat::do_cmd_stat(ctx, model, modbus, cmd).await;
  }

  let msg = format!("[REALSYS] Not Supported Cmd {:?}", cmd.cmd_type);
  send_cmd_res(
    &cmd,
    GateCmdRsltType::Fail,
    GateStatus::Na,
    format!("[REALSYS] Not Supported Cmd {:?}", cmd.cmd_type),
  )
  .await;

  Err(anyhow::anyhow!(fln!(msg)))
}
