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
  
  let read_addr = super::super::util::get_read_addr(&model.gate_no);

  let (rslt, stat, msg) = super::get_status(ctx, read_addr, modbus, cmd, true).await;
  
  if rslt == GateCmdRsltType::Fail {
    return Err(anyhow::anyhow!(fln!(msg)));
  }

  log::info!("[yesung] Stat rslt {rslt} stat {stat} msg {msg} addr {read_addr}");
  send_cmd_res_changed(&ctx, model, &cmd, rslt, stat, msg.clone()).await;
  Ok(DoGateCmdRslt::Success)
}