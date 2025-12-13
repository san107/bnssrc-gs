use super::pkt;
use crate::entities::tb_gate;
use crate::fln;
use crate::gate_app::gate::fptech::cmd_ctl_req;
use crate::gate_app::util::send_cmd_res_all;
use crate::gate_app::GateCmdRsltType;
use crate::gate_app::{GateCmd, GateStatus};
use crate::models::cd::DoGateCmdRslt;
use crate::GateCtx;
use tokio::net::TcpStream;

pub async fn do_cmd_down_async(
  ctx: &GateCtx,
  _model: &tb_gate::Model,
  stream: &mut TcpStream,
  cmd: &GateCmd,
) -> anyhow::Result<DoGateCmdRslt> {
  let (cmd_res, status, _data, _msg) = super::get_status(ctx, stream, cmd).await;
  if cmd_res != GateCmdRsltType::Success {
    return Err(anyhow::anyhow!(fln!("gate status not success")));
  }
  if status == GateStatus::DownOk || status == GateStatus::DownLock {
    // 이미 열림. do noting.
    let msg = format!("[FPTECH] Already Down({status}) Status");
    send_cmd_res_all(ctx, cmd, GateCmdRsltType::Success, status, msg.into()).await;
    return Ok(DoGateCmdRslt::Same);
  }

  let mut data = cmd_ctl_req::CmdCtlReq::new0();
  data.set_uplock_clear(); //
  let mut pkt = pkt::Pkt::new_ctl();
  pkt.data = data.to_bytes();

  let rslt = pkt.send_pkt(stream).await;
  if let Err(e) = rslt {
    let msg = format!("{e:?}");
    let rslt = GateCmdRsltType::Fail;
    let stat = GateStatus::Na;
    send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
    return Err(anyhow::anyhow!(fln!(msg)));
  }

  let pkt = pkt::Pkt::recv_pkt(stream).await;
  if let Err(e) = pkt {
    let msg = format!("{e:?}");
    let rslt = GateCmdRsltType::Fail;
    let stat = GateStatus::Na;
    send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
    return Err(anyhow::anyhow!(fln!(msg)));
  }

  crate::util::sleep(1000).await; // 2초 간격으로 확인.

  let mut data = cmd_ctl_req::CmdCtlReq::new0();
  data.set_down(); //
  let mut pkt = pkt::Pkt::new_ctl();
  pkt.data = data.to_bytes();

  let rslt = pkt.send_pkt(stream).await;
  if let Err(e) = rslt {
    let msg = format!("{e:?}");
    let rslt = GateCmdRsltType::Fail;
    let stat = GateStatus::Na;
    send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
    return Err(anyhow::anyhow!(fln!(msg)));
  }

  let pkt = pkt::Pkt::recv_pkt(stream).await;
  if let Err(e) = pkt {
    let msg = format!("{e:?}");
    let rslt = GateCmdRsltType::Fail;
    let stat = GateStatus::Na;
    send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
    return Err(anyhow::anyhow!(fln!(msg)));
  }

  let msg = "".to_owned();
  let rslt = GateCmdRsltType::Success;
  send_cmd_res_all(&ctx, &cmd, rslt, status, msg.clone()).await;
  return Ok(DoGateCmdRslt::Success);
}
