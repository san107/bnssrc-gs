use super::pkt;
use crate::fln;
use crate::gate_app::gate::fptech::cmd_ctl_req;
use crate::gate_app::util::send_cmd_res_all;
use crate::gate_app::GateCmdRsltType;
use crate::gate_app::{GateCmd, GateStatus};
use crate::models::cd::DoGateCmdRslt;
use crate::GateCtx;
use tokio::net::TcpStream;

pub async fn do_cmd_up_async(ctx: &GateCtx, stream: &mut TcpStream, cmd: &GateCmd) -> anyhow::Result<DoGateCmdRslt> {
  let (cmd_res, status, _data, _msg) = super::get_status(ctx, stream, cmd).await;
  if cmd_res != GateCmdRsltType::Success {
    return Err(anyhow::anyhow!(fln!("gate status not success")));
  }
  if status == GateStatus::UpOk || status == GateStatus::UpLock {
    // 이미 열림. do noting.
    let msg = "[FPTECH] Already Up Status".to_owned();
    send_cmd_res_all(ctx, cmd, GateCmdRsltType::Success, status, msg.into()).await;
    return Ok(DoGateCmdRslt::Same);
  }

  let mut data = cmd_ctl_req::CmdCtlReq::new0();
  data.set_uplock(); //
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
