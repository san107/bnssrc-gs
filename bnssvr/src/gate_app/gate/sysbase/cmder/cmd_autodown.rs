use std::str::FromStr;

use crate::{
  entities::tb_gate,
  fln,
  gate_app::{gate::sysbase::pkt, tx_gate, util::send_cmd_res_all, GateCmd, GateCmdGateAutoDown},
  models::cd::{DoGateCmdRslt, GateCmdRsltType, GateStatus},
  GateCtx,
};
use tokio_modbus::client::{Context, Writer};

pub async fn do_cmd_autodown(
  ctx: &GateCtx,
  model: &tb_gate::Model,
  modbus: &mut Context,
  cmd: &GateCmd,
) -> anyhow::Result<DoGateCmdRslt> {
  let stat = GateStatus::from_str(model.gate_stat.clone().as_ref().unwrap_or(&"Na".to_owned())).unwrap_or(GateStatus::Na);

  // clear data.
  let rslt = modbus.write_multiple_registers(pkt::CMD_ADDR_STAT, &[0; 2]).await;
  if let Err(e) = rslt {
    let msg = format!("[SYSBASE] modbus write errro {e:?} {} {}", cmd.cmd_type, cmd.gate_seq);
    log::error!("{msg}");
    let rslt = GateCmdRsltType::Fail;
    send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
    return Err(anyhow::anyhow!(fln!(msg)));
  }

  crate::util::sleep(1000).await;

  let addr = super::pkt::CMD_ADDR_DOWN; // down command address
  let rslt = modbus.write_single_register(addr, 1).await;
  if let Err(e) = rslt {
    //실패.
    let msg = format!(
      "[SYSBASE] modbus write errro {e:?} {} {} {}",
      cmd.cmd_type, cmd.gate_seq, model.gate_nm
    );
    log::error!("{msg}");
    let rslt = GateCmdRsltType::Fail;
    send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
    return Err(anyhow::anyhow!(fln!(msg)));
  }
  // gate down 후속처리.
  tx_gate::send_gate_cmd(Box::new(GateCmdGateAutoDown {
    gate_seq: model.gate_seq,
    gate: model.clone(),
  }))
  .await;
  crate::util::sleep(1000).await;

  let rslt = modbus.write_single_register(addr, 0).await;
  if let Err(e) = rslt {
    //실패.
    let msg = format!(
      "[SYSBASE] modbus write errro {e:?} {} {} {}",
      cmd.cmd_type, cmd.gate_seq, model.gate_nm
    );
    log::error!("{msg}");
    let rslt = GateCmdRsltType::Fail;
    send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
    return Err(anyhow::anyhow!(fln!(msg)));
  }

  log::debug!(
    "[SYSBASE] modbus write success...{} {} {}",
    cmd.cmd_type,
    cmd.gate_seq,
    model.gate_nm
  );

  let rslt = GateCmdRsltType::Success;
  let stat = GateStatus::DownOk;
  send_cmd_res_all(&ctx, &cmd, rslt, stat, "".to_owned()).await;

  Ok(DoGateCmdRslt::Success)
}
