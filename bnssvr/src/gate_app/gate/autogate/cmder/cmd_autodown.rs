use crate::{
  eanyhow,
  entities::tb_gate,
  gate_app::{
    tx_gate,
    util::{send_cmd_res_all, stream_write_all},
    GateCmd, GateCmdGateAutoDown, GateCmdRsltType, GateStatus,
  },
  models::cd::DoGateCmdRslt,
  GateCtx,
};
use tokio::net::TcpStream;

/**
 * AUTO DOWN 명령어.
 */
pub async fn do_cmd_autodown(
  ctx: &GateCtx,
  model: &tb_gate::Model,
  stream: &mut TcpStream,
  cmd: &GateCmd,
) -> anyhow::Result<DoGateCmdRslt> {
  let sbytes: Vec<u8> = [&[02], "STATUS".as_bytes(), &[03]].concat();
  if !stream_write_all(ctx, stream, &sbytes, cmd).await {
    return Err(eanyhow!("Stream Write All Fail"));
  }
  let autodownmsg = cmd.msg.clone().unwrap_or("".to_owned());
  let (res_code, res_msg) = super::recv_cmd_res(stream, 5000).await;
  if res_code != GateCmdRsltType::Success {
    let msg = format!("[AGAUTO] Sock Recv Fail{autodownmsg}");
    let rslt = GateCmdRsltType::Fail;
    let stat = GateStatus::Na;
    send_cmd_res_all(ctx, cmd, rslt, stat, msg.clone()).await;
    return Err(eanyhow!(msg));
  }
  log::debug!("[AGAUTO] get status {res_msg} {autodownmsg}");

  let status = super::super::get_str_to_status(&res_msg);
  if let GateStatus::DownOk = status {
    log::warn!("[AGAUTO] Already Down Status {status:?} {autodownmsg}");
    let rslt = GateCmdRsltType::Success;
    let msg = format!("[AGAUTO] Already Down Status {autodownmsg}");
    send_cmd_res_all(ctx, cmd, rslt, status, msg.into()).await;
    return Ok(DoGateCmdRslt::Same);
  }

  if let GateStatus::UpLock = status {
    let sbytes: Vec<u8> = [&[02], "GATE UNLOCK".as_bytes(), &[03]].concat();
    if !stream_write_all(ctx, stream, &sbytes, cmd).await {
      return Err(eanyhow!("Stream Write All Fail"));
    }
    log::debug!("[AGAUTO] send unlock {autodownmsg}");
    //crate::util::sleep(500).await; // sleep.
  }

  let sbytes: Vec<u8> = [&[02], "GATE DOWN".as_bytes(), &[03]].concat();
  if !stream_write_all(ctx, stream, &sbytes, cmd).await {
    return Err(eanyhow!("Stream Write All Fail"));
  }
  log::debug!("[AGAUTO] send down {autodownmsg}");

  // gate down 후속처리.
  tx_gate::send_gate_cmd(Box::new(GateCmdGateAutoDown {
    gate_seq: model.gate_seq,
    gate: model.clone(),
  }))
  .await;

  let (res_code, res_msg) = super::recv_cmd_res(stream, 5000).await;
  log::debug!("{res_code:?} : {res_msg:?}");
  let (res_code, res_msg) = super::recv_cmd_res(stream, 15000).await;
  log::debug!("{res_code:?} : {res_msg:?}");
  if res_code != GateCmdRsltType::Success {
    log::error!("[AGAUTO] 수신에러 : {res_code:?} {res_msg} {autodownmsg}");
    let msg = format!("[AGAUTO] Sock Recv Fail {autodownmsg}");
    let rslt = GateCmdRsltType::Fail;
    let stat = GateStatus::Na;
    send_cmd_res_all(ctx, cmd, rslt, stat, msg.clone()).await;
    return Err(eanyhow!(msg));
  }
  if "GATE DOWN OK" == res_msg {
    // 최종성공.
    let rslt = GateCmdRsltType::Success;
    let stat = GateStatus::DownOk;
    let msg = format!("[AGAUTO] {autodownmsg}");
    send_cmd_res_all(ctx, cmd, rslt, stat, msg).await;
    return Ok(DoGateCmdRslt::Success);
  }
  let msg = format!("[AGAUTO] 처리결과에러 : {res_code:?} {res_msg} {autodownmsg}");
  log::error!("{msg}");
  let rslt = GateCmdRsltType::Fail;
  let stat = GateStatus::Na;
  let res_msg = format!("[AGAUTO] {res_msg} {autodownmsg}");
  send_cmd_res_all(ctx, cmd, rslt, stat, res_msg).await;
  Err(eanyhow!(msg))
}
