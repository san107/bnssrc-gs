use crate::{
  entities::tb_gate,
  fln,
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
  let addr = super::super::util::get_gate_addr(&model.gate_no);
  log::debug!("[HPSYS] addr is {addr}");
  let (rslt, stat, msg) = super::get_status_changed(ctx, addr, modbus, model, cmd).await;
  if rslt == GateCmdRsltType::Fail {
    // 실패의 경우에는 안에서 처리함.
    return Err(anyhow::anyhow!(fln!(msg)));
  }

  // 성공.
  log::info!("[HPSYS] Stat rslt {rslt} stat {stat} msg {msg}");
  let msg = format!("{msg}");
  //send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
  send_cmd_res_changed(ctx, model, cmd, rslt, stat, msg).await;
  Ok(DoGateCmdRslt::Success)
}
