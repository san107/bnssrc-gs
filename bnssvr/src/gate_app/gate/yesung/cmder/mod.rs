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
 * 상태가져오기 - 3개 주소를 각각 읽음
 */
pub async fn get_status(
  ctx: &GateCtx,
  _addr: u16, // 사용 안 함
  modbus: &mut Context,
  cmd: &GateCmd,
  skipres: bool,
) -> (GateCmdRsltType, GateStatus, String) {
  let cmdmsg = cmd.msg.clone().unwrap_or("".to_owned());

  // P00, P08, P09를 각각 읽기
  let remote_addr = super::util::get_read_remote_addr(&None);
  let up_ok_addr = super::util::get_read_up_ok_addr(&None);
  let down_ok_addr = super::util::get_read_down_ok_addr(&None);

  let remote = gate::sock::do_read_input_registers(modbus, remote_addr, 1).await;
  let up_ok = gate::sock::do_read_input_registers(modbus, up_ok_addr, 1).await;
  let down_ok = gate::sock::do_read_input_registers(modbus, down_ok_addr, 1).await;

  // 에러 체크
  if let Err(e) = remote {
    let msg = format!("[yesung] read P00 fail {e:?}{cmdmsg}");
    log::error!("{msg}");
    let rslt = GateCmdRsltType::Fail;
    let stat = GateStatus::Na;
    if !skipres {
      send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
    }
    return (rslt, stat, msg);
  }

  // 값 추출
  let remote_val = remote.unwrap().get(0).unwrap().clone();
  let up_ok_val = up_ok.unwrap_or(vec![0]).get(0).unwrap().clone();
  let down_ok_val = down_ok.unwrap_or(vec![0]).get(0).unwrap().clone();

  let (rslt, stat) = pkt::get_yesung_stat(remote_val, up_ok_val, down_ok_val);
  let statmsg = pkt::get_yesung_stat_msg(remote_val, up_ok_val, down_ok_val);

  log::debug!(
    "[yesung] P00={} P08={} P09={} {cmdmsg} {statmsg}",
    remote_val,
    up_ok_val,
    down_ok_val
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
