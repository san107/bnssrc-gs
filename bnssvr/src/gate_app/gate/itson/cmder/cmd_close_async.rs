use super::pkt;
use crate::entities::tb_gate;
use crate::fln;
use crate::gate_app::tx_gate;
use crate::gate_app::util::send_cmd_res_all;
use crate::gate_app::util::stream_write_all;
use crate::gate_app::util::vec_to_hex;
use crate::gate_app::GateCmdGateDown;
use crate::gate_app::GateCmdRsltType;
use crate::gate_app::{GateCmd, GateStatus};
use crate::models::cd::DoGateCmdRslt;
use crate::GateCtx;
use tokio::net::TcpStream;

pub async fn do_cmd_close_async(
  ctx: &GateCtx,
  model: &tb_gate::Model,
  stream: &mut TcpStream,
  cmd: &GateCmd,
) -> anyhow::Result<DoGateCmdRslt> {
  let sbytes = pkt::get_cmd_close();
  if !stream_write_all(ctx, stream, &sbytes, cmd).await {
    return Err(anyhow::anyhow!(fln!("stream write all fail")));
  };
  let (code, res) = super::recv_cmd_res(ctx, stream, cmd).await;
  if code != GateCmdRsltType::Success {
    let msg = format!("[ITSON] cmd res not success {:?} {:?}", code, res);
    log::error!("{msg}");
    return Err(anyhow::anyhow!(fln!(msg)));
  }
  if !super::is_ack(ctx, cmd, &res).await {
    let msg = format!("[ITSON] res is not ack {:?}", vec_to_hex(&res));
    log::error!("{msg}");
    return Err(anyhow::anyhow!(fln!(msg)));
  }

  tx_gate::send_gate_cmd(Box::new(GateCmdGateDown {
    gate_seq: cmd.gate_seq,
    gate: model.clone(),
  }))
  .await;

  let rslt = GateCmdRsltType::Success;
  let stat = GateStatus::DownOk;
  let msg = format!("[ITSON] {} Request Ok", cmd.cmd_type);
  send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
  Ok(DoGateCmdRslt::Success)
}
