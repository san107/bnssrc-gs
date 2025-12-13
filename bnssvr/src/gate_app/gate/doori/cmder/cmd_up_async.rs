use super::pkt;
use crate::{
  entities::tb_gate,
  fln, flnf,
  gate_app::{util::send_cmd_res_all, GateCmd},
  models::cd::{DoGateCmdRslt, GateCmdRsltType, GateStatus},
  GateCtx,
};
use tokio_modbus::client::{Context, Writer};

pub async fn do_cmd_up_async(
  ctx: &GateCtx,
  model: &tb_gate::Model,
  modbus: &mut Context,
  cmd: &GateCmd,
) -> anyhow::Result<DoGateCmdRslt> {
  let (rslt, stat, msg, _automan, _remloc, _wind) = super::get_status(ctx, modbus, cmd).await;
  if let GateCmdRsltType::Fail = rslt {
    // 실패의 경우에는 안에서 처리함.
    return Err(anyhow::anyhow!(flnf!(
      "get_status fail {msg} {} {} {}",
      cmd.cmd_type,
      cmd.gate_seq,
      model.gate_nm
    )));
  } else if let GateCmdRsltType::ModeErr = rslt {
    let msg = format!("[DOORI] ModeErr {msg} {} {} {}", cmd.cmd_type, cmd.gate_seq, model.gate_nm);
    log::error!("{msg} {} {}", cmd.cmd_type, cmd.gate_seq);
    send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
    return Err(anyhow::anyhow!(fln!(msg)));
  }

  let addr = pkt::CMD_ADDR_UP;
  log::debug!("[DOORI] addr is {addr} {} {}", cmd.cmd_type, cmd.gate_seq);

  let rslt = modbus.write_single_coil(addr, true).await;
  if let Err(e) = rslt {
    //실패.
    let msg = format!("[DOORI] modbus write errro {e:?} {} {}", cmd.cmd_type, cmd.gate_seq);
    log::error!("{msg}");
    let rslt = GateCmdRsltType::Fail;
    let stat = GateStatus::Na;
    send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
    return Err(anyhow::anyhow!(fln!(msg)));
  }

  crate::util::sleep(2000).await;

  let rslt = modbus.write_single_coil(addr, false).await;
  if let Err(e) = rslt {
    //실패.
    let msg = format!("[DOORI] modbus write errro {e:?} {} {}", cmd.cmd_type, cmd.gate_seq);
    log::error!("{msg}");
    let rslt = GateCmdRsltType::Fail;
    let stat = GateStatus::Na;
    send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
    return Err(anyhow::anyhow!(fln!(msg)));
  }

  log::debug!("[DOORI] up_async success {} {}", cmd.cmd_type, cmd.gate_seq);
  send_cmd_res_all(&ctx, &cmd, GateCmdRsltType::Success, stat, String::new()).await;
  Ok(DoGateCmdRslt::Success)
}
