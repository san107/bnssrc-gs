use crate::{
  entities::tb_gate,
  fln,
  gate_app::{
    tx_gate,
    util::{send_cmd_res_all, stream_write_all},
    GateCmd, GateCmdGateDown, GateCmdRsltType, GateStatus,
  },
  models::cd::DoGateCmdRslt,
  GateCtx,
};
use tokio::net::TcpStream;

pub async fn do_cmd_down(
  ctx: &GateCtx,
  model: &tb_gate::Model,
  stream: &mut TcpStream,
  cmd: &GateCmd,
) -> anyhow::Result<DoGateCmdRslt> {
  let sbytes: Vec<u8> = [&[02], "STATUS".as_bytes(), &[03]].concat();
  if !stream_write_all(ctx, stream, &sbytes, cmd).await {
    return Err(anyhow::anyhow!(fln!("Stream Write All Fail")));
  }
  let (res_code, res_msg) = super::recv_cmd_res(stream, 5000).await;
  if res_code != GateCmdRsltType::Success {
    let msg = format!("[AUTOGATE] Sock Recv Fail");
    let rslt = GateCmdRsltType::Fail;
    let stat = GateStatus::Na;
    send_cmd_res_all(ctx, cmd, rslt, stat, msg.clone()).await;
    return Err(anyhow::anyhow!(fln!(msg)));
  }
  log::debug!("[AUTOGATE] get status {res_msg}");

  let status = super::super::get_str_to_status(&res_msg);
  if status == GateStatus::DownOk {
    log::warn!("[AUTOGATE] Already Down Status {status:?}");
    let rslt = GateCmdRsltType::Success;
    let msg = "[AUTOGATE] Already Down Status";
    send_cmd_res_all(ctx, cmd, rslt, status, msg.into()).await;
    return Ok(DoGateCmdRslt::Same);
  }

  if status == GateStatus::UpLock {
    let sbytes: Vec<u8> = [&[02], "GATE UNLOCK".as_bytes(), &[03]].concat();
    if !stream_write_all(ctx, stream, &sbytes, cmd).await {
      return Err(anyhow::anyhow!(fln!("Stream Write All Fail")));
    }
    log::debug!("[AUTOGATE] send unlock");
    //crate::util::sleep(500).await; // sleep.
  }

  let sbytes: Vec<u8> = [&[02], "GATE DOWN".as_bytes(), &[03]].concat();
  if !stream_write_all(ctx, stream, &sbytes, cmd).await {
    return Err(anyhow::anyhow!(fln!("Stream Write All Fail")));
  }
  log::debug!("[AUTOGATE] send down");

  tx_gate::send_gate_cmd(Box::new(GateCmdGateDown {
    gate_seq: cmd.gate_seq,
    gate: model.clone(),
  }))
  .await;

  let (res_code, res_msg) = super::recv_cmd_res(stream, 5000).await;
  log::debug!("{res_code:?} : {res_msg:?}");
  let (res_code, res_msg) = super::recv_cmd_res(stream, 15000).await;
  log::debug!("{res_code:?} : {res_msg:?}");
  if res_code != GateCmdRsltType::Success {
    log::error!("[AUTOGATE] 수신에러 : {res_code:?} {res_msg}");
    let msg = format!("[AUTOGATE] Sock Recv Fail");
    let rslt = GateCmdRsltType::Fail;
    let stat = GateStatus::Na;
    send_cmd_res_all(ctx, cmd, rslt, stat, msg).await;
    return Err(anyhow::anyhow!(fln!("Sock Recv Fail")));
  }
  if "GATE DOWN OK" == res_msg {
    // 최종성공.
    let rslt = GateCmdRsltType::Success;
    let stat = GateStatus::DownOk;
    send_cmd_res_all(ctx, cmd, rslt, stat, "".to_owned()).await;
    return Ok(DoGateCmdRslt::Success);
  }
  log::error!("[AUTOGATE] 처리결과에러 : {res_code:?} {res_msg}");
  let rslt = GateCmdRsltType::Fail;
  let stat = GateStatus::Na;
  send_cmd_res_all(ctx, cmd, rslt, stat, res_msg).await;

  Err(anyhow::anyhow!(fln!("Sock Recv Fail")))
}
