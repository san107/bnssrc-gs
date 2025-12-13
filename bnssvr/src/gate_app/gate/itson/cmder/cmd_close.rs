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
use tokio::time::Instant;

pub async fn do_cmd_close(
  ctx: &GateCtx,
  model: &tb_gate::Model,
  stream: &mut TcpStream,
  cmd: &GateCmd,
) -> anyhow::Result<DoGateCmdRslt> {
  let (cmd_res, status, _elock) = super::get_gate_status(ctx, stream, cmd).await;
  if cmd_res != GateCmdRsltType::Success {
    return Err(anyhow::anyhow!(fln!("gate status not success")));
  }
  if status == GateStatus::DownOk {
    // 이미 열림. do noting.
    let msg = "[ITSON] Already Down Status".to_owned();
    send_cmd_res_all(ctx, cmd, GateCmdRsltType::Success, status, msg.into()).await;
    return Ok(DoGateCmdRslt::Same);
  }
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

  let now = Instant::now();

  loop {
    if now.elapsed().as_millis() > 15000 {
      let msg = format!("[ITSON] Timeout Elapsed {} secs", now.elapsed().as_secs());
      let rslt = GateCmdRsltType::Fail;
      let stat = GateStatus::Na;
      send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
      return Err(anyhow::anyhow!(fln!(msg)));
    }
    crate::util::sleep(2000).await; // 2초 간격으로 확인.
    let (cmd_stat, stat, _elock) = super::get_gate_status(ctx, stream, cmd).await;
    if cmd_stat != GateCmdRsltType::Success {
      log::error!("[ITSON] cmdstat {:?} gate state {:?}", cmd_stat, stat);
      return Err(anyhow::anyhow!(fln!("gate status not success")));
    }
    if stat == GateStatus::DownOk {
      let msg = "".to_owned();
      let rslt = GateCmdRsltType::Success;
      send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
      return Ok(DoGateCmdRslt::Success);
    }
  }
}
