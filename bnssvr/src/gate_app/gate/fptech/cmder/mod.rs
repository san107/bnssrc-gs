use crate::{
  entities::tb_gate,
  fln,
  gate_app::{
    gate::fptech::{cmd_stat_info, pkt},
    util::{send_cmd_res, send_cmd_res_all, send_cmd_res_changed},
    GateCmd, GateCmdRsltType, GateStatus,
  },
  models::cd::{DoGateCmdRslt, GateCmdType},
  sock, GateCtx,
};
use tokio::net::TcpStream;

mod cmd_auto_down;
mod cmd_down;
mod cmd_down_async;
mod cmd_stat;
mod cmd_up;
mod cmd_up_async;

pub async fn do_cmd(
  ctx: &GateCtx,
  model: &tb_gate::Model,
  stream: &mut TcpStream,
  cmd: &GateCmd,
) -> anyhow::Result<DoGateCmdRslt> {
  let cmdmsg = cmd.msg.clone().unwrap_or("".to_owned());

  if cmd.cmd_type == GateCmdType::Stat {
    return cmd_stat::do_cmd_stat(ctx, model, stream, cmd).await;
  } else if cmd.cmd_type == GateCmdType::Up {
    return cmd_up::do_cmd_up(ctx, stream, cmd).await;
  } else if cmd.cmd_type == GateCmdType::UpAsync {
    return cmd_up_async::do_cmd_up_async(ctx, stream, cmd).await;
  } else if cmd.cmd_type == GateCmdType::Down {
    return cmd_down::do_cmd_down(ctx, model, stream, cmd).await;
  } else if cmd.cmd_type == GateCmdType::DownAsync {
    return cmd_down_async::do_cmd_down_async(ctx, model, stream, cmd).await;
  } else if cmd.cmd_type == GateCmdType::AutoDown {
    return cmd_auto_down::do_cmd_auto_down(ctx, model, stream, cmd).await;
  }

  let msg = format!("[FPTECH] Not Supported Cmd {:?}{cmdmsg}", cmd.cmd_type);
  send_cmd_res(&cmd, GateCmdRsltType::Fail, GateStatus::Na, msg.clone()).await;

  Err(anyhow::anyhow!(fln!(msg)))
}

async fn get_status(
  ctx: &GateCtx,
  stream: &mut TcpStream,
  cmd: &GateCmd,
) -> (GateCmdRsltType, GateStatus, Option<cmd_stat_info::CmdStatInfoRes>, String) {
  // req packet .
  let mut pkt = pkt::Pkt::new_stat();

  pkt.cmd = pkt::Cmd::StatInfo;
  pkt.data = cmd_stat_info::CmdStatInfoReq::new0().to_bytes();
  pkt.fill_checksum();
  let bytes = pkt.to_bytes();

  let rslt = sock::send::send(stream, &bytes).await;

  if let Err(e) = rslt {
    let msg = format!("{e:?}");
    let rslt = GateCmdRsltType::Fail;
    let stat = GateStatus::Na;
    send_cmd_res_all(ctx, cmd, rslt, stat, msg.clone()).await;
    return (rslt, stat, None, msg);
  }

  let rslt = pkt::Pkt::recv_pkt(stream).await;

  if let Err(e) = rslt {
    let msg = format!("{e:?}");
    let rslt = GateCmdRsltType::Fail;
    let stat = GateStatus::Na;
    send_cmd_res_all(ctx, cmd, rslt, stat, msg.clone()).await;
    return (rslt, stat, None, msg);
  }
  let pkt = rslt.unwrap();

  let data = cmd_stat_info::CmdStatInfoRes::from_bytes(&pkt.data);

  if let Err(e) = data {
    let msg = format!("{e:?}");
    let rslt = GateCmdRsltType::Fail;
    let stat = GateStatus::Na;
    send_cmd_res_all(ctx, cmd, rslt, stat, msg.clone()).await;
    return (rslt, stat, None, msg);
  }

  let data = data.unwrap();

  let stat = data.gate_status();
  let msg = data.gate_status_str();
  let rslt = GateCmdRsltType::Success;

  //send_cmd_res_all(ctx, cmd, rslt, stat, msg.clone()).await;

  (rslt, stat, Some(data), msg)
}

async fn get_status_changed(
  ctx: &GateCtx,
  stream: &mut TcpStream,
  model: &tb_gate::Model,
  cmd: &GateCmd,
) -> (GateCmdRsltType, GateStatus, Option<cmd_stat_info::CmdStatInfoRes>, String) {
  // req packet .
  let mut pkt = pkt::Pkt::new_stat();

  pkt.cmd = pkt::Cmd::StatInfo;
  pkt.data = cmd_stat_info::CmdStatInfoReq::new0().to_bytes();
  pkt.fill_checksum();
  let bytes = pkt.to_bytes();

  let rslt = sock::send::send(stream, &bytes).await;

  if let Err(e) = rslt {
    let msg = format!("{e:?}");
    let rslt = GateCmdRsltType::Fail;
    let stat = GateStatus::Na;
    send_cmd_res_changed(ctx, model, cmd, rslt, stat, msg.clone()).await;
    return (rslt, stat, None, msg);
  }

  let rslt = pkt::Pkt::recv_pkt(stream).await;

  if let Err(e) = rslt {
    let msg = format!("{e:?}");
    let rslt = GateCmdRsltType::Fail;
    let stat = GateStatus::Na;
    send_cmd_res_changed(ctx, model, cmd, rslt, stat, msg.clone()).await;
    return (rslt, stat, None, msg);
  }
  let pkt = rslt.unwrap();

  let data = cmd_stat_info::CmdStatInfoRes::from_bytes(&pkt.data);

  if let Err(e) = data {
    let msg = format!("{e:?}");
    let rslt = GateCmdRsltType::Fail;
    let stat = GateStatus::Na;
    send_cmd_res_changed(ctx, model, cmd, rslt, stat, msg.clone()).await;
    return (rslt, stat, None, msg);
  }

  let data = data.unwrap();

  let stat = data.gate_status();
  let msg = data.gate_status_str();
  let rslt = GateCmdRsltType::Success;

  //send_cmd_res_changed(ctx, model, cmd, rslt, stat, msg.clone()).await;

  (rslt, stat, Some(data), msg)
}
