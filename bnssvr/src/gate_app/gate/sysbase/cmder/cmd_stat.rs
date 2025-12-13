use crate::{
  entities::tb_gate,
  flnf,
  gate_app::{util::send_cmd_res_changed, GateCmd},
  models::cd::{DoGateCmdRslt, GateCmdRsltType},
  GateCtx,
};
use tokio_modbus::client::Context;

pub async fn do_cmd_stat(
  ctx: &GateCtx,
  model: &tb_gate::Model,
  modbus: &mut Context,
  cmd: &GateCmd,
) -> anyhow::Result<DoGateCmdRslt> {
  let (rslt, stat, msg) = super::get_status_changed(ctx, modbus, model, cmd).await;
  if let GateCmdRsltType::Fail = rslt {
    // 실패의 경우에는 안에서 처리함.
    return Err(anyhow::anyhow!(flnf!(
      "get_status_changed fail {msg} {} {} {}",
      cmd.cmd_type,
      cmd.gate_seq,
      model.gate_nm
    )));
  }

  // 성공.
  log::info!(
    "[SYSBASE] Stat rslt {rslt} stat {stat} msg {msg} {} {} {}",
    cmd.cmd_type,
    cmd.gate_seq,
    model.gate_nm
  );
  let msg = format!("[SYSBASE] Stat{msg} {} {} {}", cmd.cmd_type, cmd.gate_seq, model.gate_nm);
  // send_cmd_res(&cmd, rslt, stat, msg.clone()).await;
  send_cmd_res_changed(ctx, model, cmd, rslt, stat, msg.clone()).await;
  Ok(DoGateCmdRslt::Success)
}
