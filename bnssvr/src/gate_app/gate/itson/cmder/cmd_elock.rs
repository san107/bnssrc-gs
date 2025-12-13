use std::str::FromStr;

use super::pkt;
use crate::entities::tb_gate;
use crate::fln;
use crate::gate_app::util::send_cmd_res_itson;
use crate::gate_app::util::stream_write_all;
use crate::gate_app::util::vec_to_hex;
use crate::gate_app::{GateCmd, GateStatus};
use crate::models::cd::DoGateCmdRslt;
use crate::models::cd::{ElockStatus, GateCmdRsltType};
use crate::GateCtx;
use tokio::net::TcpStream;

pub async fn do_cmd_elock(
  ctx: &GateCtx,
  model: &tb_gate::Model,
  stream: &mut TcpStream,
  cmd: &GateCmd,
) -> anyhow::Result<DoGateCmdRslt> {
  let sbytes = pkt::get_cmd_elock();
  log::debug!("[ITSON] cmd_elock {}", vec_to_hex(&sbytes));
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
  let stat = GateStatus::from_str(model.gate_stat.as_ref().unwrap_or(&"".to_owned()).as_str()).unwrap_or(GateStatus::Na);
  let elock = ElockStatus::Lock;
  let msg = format!("[ITSON] {} Request Ok", cmd.cmd_type);
  send_cmd_res_itson(&cmd, rslt, stat, elock, msg.clone()).await;
  Ok(DoGateCmdRslt::Success)
}
