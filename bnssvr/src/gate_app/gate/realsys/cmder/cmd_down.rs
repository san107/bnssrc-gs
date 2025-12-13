use crate::{
  entities::tb_gate,
  fln,
  gate_app::{gate::realsys::pkt, tx_gate, util::send_cmd_res_all, GateCmd, GateCmdGateDown},
  models::cd::{DoGateCmdRslt, GateCmdRsltType, GateStatus},
  GateCtx,
};
use std::str::FromStr;
use tokio_modbus::client::{Context, Writer};

/**
 * down command.
 */
pub async fn do_cmd_down(
  ctx: &GateCtx,
  model: &tb_gate::Model,
  modbus: &mut Context,
  cmd: &GateCmd,
) -> anyhow::Result<DoGateCmdRslt> {
  let stat = GateStatus::from_str(model.gate_stat.clone().as_ref().unwrap_or(&"Na".to_owned())).unwrap_or(GateStatus::Na);

  let addr = pkt::CMD_ADDR;
  let down_cmd = pkt::get_realsys_down_cmd();

  // clear data.
  let rslt = modbus.write_single_register(addr, 0).await;
  if let Err(e) = rslt {
    let msg = format!("[REALSYS] modbus write errro {e:?} {} {}", cmd.cmd_type, cmd.gate_seq);
    log::error!("{msg}");
    let rslt = GateCmdRsltType::Fail;
    send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
    return Err(anyhow::anyhow!(fln!(msg)));
  }

  crate::util::sleep(1000).await;

  log::debug!(
    "[REALSYS] addr is {addr} downcmd {down_cmd}  {} {}",
    cmd.cmd_type,
    cmd.gate_seq
  );

  let rslt = modbus.write_single_register(addr, down_cmd).await;
  if let Err(e) = rslt {
    //실패.
    let msg = format!(
      "[REALSYS] modbus write errro {e:?} {} {} {}",
      cmd.cmd_type, cmd.gate_seq, model.gate_nm
    );
    log::error!("{msg}");
    let rslt = GateCmdRsltType::Fail;
    send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
    return Err(anyhow::anyhow!(fln!(msg)));
  }
  crate::util::sleep(1000).await;

  let rslt = modbus.write_single_register(addr, 0).await;
  if let Err(e) = rslt {
    //실패.
    let msg = format!(
      "[REALSYS] modbus write errro {e:?} {} {} {}",
      cmd.cmd_type, cmd.gate_seq, model.gate_nm
    );
    log::error!("{msg}");
    let rslt = GateCmdRsltType::Fail;
    send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
    return Err(anyhow::anyhow!(fln!(msg)));
  }

  tx_gate::send_gate_cmd(Box::new(GateCmdGateDown {
    gate_seq: cmd.gate_seq,
    gate: model.clone(),
  }))
  .await;

  log::debug!(
    "[REALSYS] modbus write success... {} {} {}",
    cmd.cmd_type,
    cmd.gate_seq,
    model.gate_nm
  );

  let rslt = GateCmdRsltType::Success;
  let stat = GateStatus::DownOk;
  send_cmd_res_all(&ctx, &cmd, rslt, stat, "".to_owned()).await;

  Ok(DoGateCmdRslt::Success)
}
