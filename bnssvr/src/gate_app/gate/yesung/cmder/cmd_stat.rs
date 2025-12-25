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
  // get_status 호출 (addr는 0으로 무시됨)
  let (rslt, stat, msg) = super::get_status(ctx, 0, modbus, cmd, true).await;

  if rslt == GateCmdRsltType::Fail {
    return Err(anyhow::anyhow!(fln!(msg)));
  }

  // 성공
  log::info!("[yesung] Stat rslt {rslt} stat {stat} msg {msg}");
  send_cmd_res_changed(&ctx, model, &cmd, rslt, stat, msg.clone()).await;
  Ok(DoGateCmdRslt::Success)
}
