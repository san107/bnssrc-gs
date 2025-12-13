use crate::{
  entities::tb_gate,
  fln,
  gate_app::{
    util::{send_cmd_res_all, stream_write_all},
    GateCmd, GateCmdRsltType, GateStatus,
  },
  models::cd::DoGateCmdRslt,
  GateCtx,
};
use tokio::net::TcpStream;

/**
 * UP 명령어
 */
pub async fn do_cmd_up(
  ctx: &GateCtx,
  _model: &tb_gate::Model,
  stream: &mut TcpStream,
  cmd: &GateCmd,
) -> anyhow::Result<DoGateCmdRslt> {
  let sbytes: Vec<u8> = [&[02], "STATUS".as_bytes(), &[03]].concat();
  if !stream_write_all(ctx, stream, &sbytes, cmd).await {
    return Err(anyhow::anyhow!(fln!("Stream Write All Fail")));
  }
  let (res_code, res_msg) = super::recv_cmd_res(stream, 5000).await;
  if res_code != GateCmdRsltType::Success {
    let rslt = GateCmdRsltType::Fail;
    let stat = GateStatus::Na;
    let msg = "[AUTOGATE] Sock Recv Fail";
    send_cmd_res_all(ctx, cmd, rslt, stat, msg.into()).await;
    return Err(anyhow::anyhow!(fln!(msg)));
  }
  log::debug!("[AUTOGATE] get status {res_msg}");
  let status = super::super::get_str_to_status(&res_msg);
  if status == GateStatus::UpOk || status == GateStatus::UpLock {
    log::warn!("[AUTOGATE] Already Up Status {status:?}");

    let rslt = GateCmdRsltType::Success;
    let msg = "[AUTOGATE] Already Up Status";
    send_cmd_res_all(ctx, cmd, rslt, status, msg.into()).await;
    return Ok(DoGateCmdRslt::Same);
  }

  let sbytes: Vec<u8> = [&[02], "GATE UPLOCK".as_bytes(), &[03]].concat();
  if !stream_write_all(ctx, stream, &sbytes, cmd).await {
    return Err(anyhow::anyhow!(fln!("Stream Write All Fail")));
  }
  log::debug!("[AUTOGATE] send up");

  let (res_code, res_msg) = super::recv_cmd_res(stream, 5000).await;
  log::debug!("{res_code:?} : {res_msg:?}");
  let (res_code, res_msg) = super::recv_cmd_res(stream, 15000).await;
  log::debug!("{res_code:?} : {res_msg:?}");
  if res_code != GateCmdRsltType::Success {
    log::error!("[AUTOGATE] 수신에러 : {res_code:?} {res_msg}");
    let rslt = GateCmdRsltType::Fail;
    let stat = GateStatus::Na;
    let msg = "[AUTOGATE] Sock Recv Fail";
    send_cmd_res_all(ctx, cmd, rslt, stat, msg.into()).await;
    return Err(anyhow::anyhow!(fln!(msg)));
  }
  if "GATE UP OK" == res_msg {
    // 최종성공.
    let rslt = GateCmdRsltType::Success;
    let stat = GateStatus::UpLock;
    send_cmd_res_all(ctx, cmd, rslt, stat, "".to_owned()).await;
    return Ok(DoGateCmdRslt::Success);
  }
  let msg = format!("[AUTOGATE] 처리결과에러 : {res_code:?} {res_msg}");
  log::error!("{msg}");
  let rslt = GateCmdRsltType::Fail;
  let stat = GateStatus::Na;
  send_cmd_res_all(ctx, cmd, rslt, stat, res_msg).await;

  Err(anyhow::anyhow!(fln!(msg)))
}
