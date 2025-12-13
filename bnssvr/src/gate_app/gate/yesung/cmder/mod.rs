use super::pkt;
use crate::eanyhow;
use crate::{
  entities::tb_gate,
  gate_app::{
    gate,
    util::{send_cmd_res, send_cmd_res_all},
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
mod cmd_stop;
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
  skipres: bool,
) -> (GateCmdRsltType, GateStatus, String) {
  //
  let data = gate::sock::do_read_input_registers(modbus, addr, 1).await;
  let cmdmsg = cmd.msg.clone().unwrap_or("".to_owned());

  if let Err(e) = data {
    let msg = format!("[yesung] read_holding_registers fail {e:?}{cmdmsg}");
    log::error!("{msg}");
    let rslt = GateCmdRsltType::Fail;
    let stat = GateStatus::Na;
    if !skipres {
      send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
    }
    return (rslt, stat, msg);
  }

  let data = data.unwrap();
  let data = data.get(0).unwrap().clone();
  let (rslt, stat) = pkt::get_yesung_stat(data);
  let statmsg = pkt::get_yesung_stat_msg(data);
  log::debug!(
    "[yesung] addr {} val {} flags {}  {cmdmsg} {statmsg}",
    addr,
    data,
    pkt::parse(data).join(",")
  );

  (rslt, stat, statmsg)
}

pub async fn do_cmd(ctx: &GateCtx, model: &tb_gate::Model, modbus: &mut Context, cmd: &GateCmd) -> anyhow::Result<DoGateCmdRslt> {
  if cmd.cmd_type == GateCmdType::Down {
    return cmd_down::do_cmd_down(ctx, model, modbus, cmd).await;
  } else if cmd.cmd_type == GateCmdType::AutoDown {
    return cmd_autodown::do_cmd_autodown(ctx, model, modbus, cmd).await;
  } else if cmd.cmd_type == GateCmdType::Up {
    return cmd_up::do_cmd_up(ctx, model, modbus, cmd).await;
  } else if cmd.cmd_type == GateCmdType::Stat {
    return cmd_stat::do_cmd_stat(ctx, model, modbus, cmd).await;
  } else if cmd.cmd_type == GateCmdType::DownAsync {
    return cmd_down_async::do_cmd_down_async(ctx, model, modbus, cmd).await;
  } else if cmd.cmd_type == GateCmdType::UpAsync {
    return cmd_up_async::do_cmd_up_async(ctx, model, modbus, cmd).await;
  } else if cmd.cmd_type == GateCmdType::Stop {
    return cmd_stop::do_cmd_stop(ctx, model, modbus, cmd).await;
  }

  let msg = format!("[yesung] Not Supported Cmd {:?}", cmd.cmd_type);
  log::error!("{msg}");
  send_cmd_res(&cmd, GateCmdRsltType::Fail, GateStatus::Na, msg.clone()).await;

  Err(eanyhow!(msg))
}
