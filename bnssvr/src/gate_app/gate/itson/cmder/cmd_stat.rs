use crate::entities::tb_gate;
use crate::fln;
use crate::gate_app::util::do_gate_stat_changed;
use crate::gate_app::util::send_cmd_res_itson;
use crate::gate_app::GateCmd;
use crate::gate_app::GateCmdRsltType;
use crate::models::cd::DoGateCmdRslt;
use crate::GateCtx;
use tokio::net::TcpStream;

pub async fn do_cmd_stat(
  ctx: &GateCtx,
  model: &tb_gate::Model,
  stream: &mut TcpStream,
  cmd: &GateCmd,
) -> anyhow::Result<DoGateCmdRslt> {
  let (cmd_res, status, elock) = super::get_gate_status_changed(ctx, stream, model, cmd).await;
  if cmd_res != GateCmdRsltType::Success {
    return Err(anyhow::anyhow!(fln!("gate status not success")));
  }

  let is_changed = model.gate_stat != Some(status.to_string()) || model.cmd_rslt != Some(cmd_res.to_string());

  if is_changed {
    do_gate_stat_changed(ctx, cmd, cmd_res, status, "".to_owned()).await;
  }

  let msg = "[ITSON] Stat".to_owned();
  send_cmd_res_itson(&cmd, GateCmdRsltType::Success, status, elock, msg).await;
  Ok(DoGateCmdRslt::Success)
}
