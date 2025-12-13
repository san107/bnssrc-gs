use super::pkt::{self, DooriAutoMan, DooriRemLoc, DooriWindMode};
use crate::{
  entities::tb_gate,
  fln,
  gate_app::{
    util::{send_cmd_res, send_cmd_res_all, send_cmd_res_changed},
    GateCmd,
  },
  models::cd::{DoGateCmdRslt, GateCmdRsltType, GateCmdType, GateStatus},
  GateCtx,
};
use tokio_modbus::client::{Context, Reader};

mod cmd_autodown;
mod cmd_down;
mod cmd_down_async;
mod cmd_stat;
mod cmd_up;
mod cmd_up_async;
mod cmd_wind;

/**
 * 상태가져오기.
 */
pub async fn get_status(
  ctx: &GateCtx,
  modbus: &mut Context,
  cmd: &GateCmd,
) -> (GateCmdRsltType, GateStatus, String, DooriAutoMan, DooriRemLoc, DooriWindMode) {
  let addr = pkt::CMD_ADDR_STAT;
  let data = modbus.read_coils(addr, 4).await;
  let cmdmsg = cmd.msg.clone().unwrap_or("".to_owned());
  if let Err(e) = data {
    let msg = format!("[DOORI] read_coils fail {e:?}{cmdmsg}");
    log::error!("{msg}");
    let rslt = GateCmdRsltType::Fail;
    let stat = GateStatus::Na;
    send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
    return (rslt, stat, msg, DooriAutoMan::Na, DooriRemLoc::Na, DooriWindMode::Na);
  }
  let data = data.unwrap();
  if let Err(e) = data {
    let msg = format!("[DOORI] read_coils fail {e:?}{cmdmsg}");
    log::error!("{msg}");
    let rslt = GateCmdRsltType::Fail;
    let stat = GateStatus::Na;
    send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
    return (rslt, stat, msg, DooriAutoMan::Na, DooriRemLoc::Na, DooriWindMode::Na);
  }
  let data = data.unwrap();
  let stat = pkt::get_doori_stat(&data);
  log::debug!("[DOORI] addr {} val {:?}  {cmdmsg}", addr, data,);

  let (rslt, automan, remloc, wind) = get_mode(modbus).await;
  if rslt == GateCmdRsltType::Fail {
    return (rslt, stat, "get_mode fail".to_owned(), automan, remloc, wind);
  }

  if remloc == DooriRemLoc::Remote {
    return (GateCmdRsltType::Success, stat, "".to_owned(), automan, remloc, wind);
  }

  return (GateCmdRsltType::ModeErr, stat, "".to_owned(), automan, remloc, wind);
}

pub async fn get_status_changed(
  ctx: &GateCtx,
  modbus: &mut Context,
  model: &tb_gate::Model,
  cmd: &GateCmd,
) -> (GateCmdRsltType, GateStatus, String, DooriAutoMan, DooriRemLoc, DooriWindMode) {
  let addr = pkt::CMD_ADDR_STAT;
  let data = modbus.read_coils(addr, 4).await;
  let cmdmsg = cmd.msg.clone().unwrap_or("".to_owned());
  if let Err(e) = data {
    let msg = format!("[DOORI] read_coils fail {e:?}{cmdmsg}");
    log::error!("{msg}");
    let rslt = GateCmdRsltType::Fail;
    let stat = GateStatus::Na;
    send_cmd_res_changed(&ctx, model, &cmd, rslt, stat, msg.clone()).await;
    return (rslt, stat, msg, DooriAutoMan::Na, DooriRemLoc::Na, DooriWindMode::Na);
  }
  let data = data.unwrap();
  if let Err(e) = data {
    let msg = format!("[DOORI] read_coils fail {e:?}{cmdmsg}");
    log::error!("{msg}");
    let rslt = GateCmdRsltType::Fail;
    let stat = GateStatus::Na;
    send_cmd_res_changed(&ctx, model, &cmd, rslt, stat, msg.clone()).await;
    return (rslt, stat, msg, DooriAutoMan::Na, DooriRemLoc::Na, DooriWindMode::Na);
  }
  let data = data.unwrap();
  let stat = pkt::get_doori_stat(&data);
  log::debug!("[DOORI] addr {} val {:?}  {cmdmsg}", addr, data,);

  let (_rslt, automan, remloc, wind) = get_mode(modbus).await;

  if automan == DooriAutoMan::Auto && remloc == DooriRemLoc::Remote {
    return (GateCmdRsltType::Success, stat, "".to_owned(), automan, remloc, wind);
  }

  return (GateCmdRsltType::ModeErr, stat, "".to_owned(), automan, remloc, wind);
}

pub async fn get_mode(modbus: &mut Context) -> (GateCmdRsltType, DooriAutoMan, DooriRemLoc, DooriWindMode) {
  let addr = pkt::CMD_ADDR_MODE;
  let data = modbus.read_coils(addr, 4).await;

  if let Err(e) = data {
    let msg = format!("[DOORI] read_coils fail {e:?}{addr}");
    log::error!("{msg}");
    return (GateCmdRsltType::Fail, DooriAutoMan::Na, DooriRemLoc::Na, DooriWindMode::Na);
  }
  let data = data.unwrap();
  if let Err(e) = data {
    let msg = format!("[DOORI] read_coils fail {e:?}{addr}");
    log::error!("{msg}");
    return (GateCmdRsltType::Fail, DooriAutoMan::Na, DooriRemLoc::Na, DooriWindMode::Na);
  }
  let data = data.unwrap();
  let automan = pkt::get_doori_automan(&data);
  let remloc = pkt::get_doori_remloc(&data);
  log::debug!("[DOORI] addr {} val {:?}", addr, data,);

  let addr = pkt::CMD_ADDR_WIND_MODE;
  let wind = modbus.read_coils(addr, 1).await;
  if let Err(e) = wind {
    let msg = format!("[DOORI] read_discrete_inputs fail {e:?}{addr}");
    log::error!("{msg}");
    return (GateCmdRsltType::Fail, automan, remloc, DooriWindMode::Na);
  }
  let wind = wind.unwrap();
  if let Err(e) = wind {
    let msg = format!("[DOORI] read_discrete_inputs fail {e:?}{addr}");
    log::error!("{msg}");
    return (GateCmdRsltType::Fail, automan, remloc, DooriWindMode::Na);
  }
  let wind = wind.unwrap();
  let wind = pkt::get_doori_wind_mode(&wind);

  (GateCmdRsltType::Success, automan, remloc, wind)
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
  } else if cmd.cmd_type == GateCmdType::UpAsync {
    return cmd_up_async::do_cmd_up_async(ctx, model, modbus, cmd).await;
  } else if cmd.cmd_type == GateCmdType::DownAsync {
    return cmd_down_async::do_cmd_down_async(ctx, model, modbus, cmd).await;
  } else if cmd.cmd_type == GateCmdType::Wind {
    return cmd_wind::do_cmd_wind(ctx, model, modbus, cmd).await;
  }

  let msg = format!("[DOORI] Not Supported Cmd {:?}", cmd.cmd_type);
  send_cmd_res(
    &cmd,
    GateCmdRsltType::Fail,
    GateStatus::Na,
    format!("[DOORI] Not Supported Cmd {:?}", cmd.cmd_type),
  )
  .await;

  Err(anyhow::anyhow!(fln!(msg)))
}
