use crate::entities::tb_gate;
use crate::fln;
use crate::gate_app::util::send_cmd_res_changed;
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
  let (cmd_res, status, _data, msg) = super::get_status_changed(ctx, stream, model, cmd).await;
  if cmd_res != GateCmdRsltType::Success {
    return Err(anyhow::anyhow!(fln!("gate status not success")));
  }

  send_cmd_res_changed(ctx, model, cmd, cmd_res, status, msg.clone()).await;
  // send_cmd_res_itson(&cmd, GateCmdRsltType::Success, status, elock, msg).await;
  Ok(DoGateCmdRslt::Success)
}
