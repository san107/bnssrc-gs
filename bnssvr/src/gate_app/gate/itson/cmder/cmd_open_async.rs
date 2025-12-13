use super::pkt;
use crate::fln;
use crate::gate_app::util::send_cmd_res_all;
use crate::gate_app::util::stream_write_all;
use crate::gate_app::util::vec_to_hex;
use crate::gate_app::GateCmdRsltType;
use crate::gate_app::{GateCmd, GateStatus};
use crate::models::cd::DoGateCmdRslt;
use crate::GateCtx;
use tokio::net::TcpStream;

pub async fn do_cmd_open_async(ctx: &GateCtx, stream: &mut TcpStream, cmd: &GateCmd) -> anyhow::Result<DoGateCmdRslt> {
  // let (cmd_res, status) = super::get_gate_status(ctx, stream, cmd).await;
  // if cmd_res != GateCmdRsltType::Success {
  //   return;
  // }
  // if status == GateStatus::UpOk {
  //   // 이미 열림. do noting.
  //   let msg = "[ITSON] Already Up Status".to_owned();
  //   send_cmd_res_all(ctx, cmd, GateCmdRsltType::Success, status, msg.into()).await;
  //   return;
  // }
  let sbytes = pkt::get_cmd_open();
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

  let rslt = GateCmdRsltType::Success;
  let stat = GateStatus::UpOk;
  let msg = format!("[ITSON] {} Request Ok", cmd.cmd_type);
  send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
  Ok(DoGateCmdRslt::Success)
}
