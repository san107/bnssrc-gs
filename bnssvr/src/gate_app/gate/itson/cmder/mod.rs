use super::pkt;
use super::send_cmd_res;
use crate::entities::tb_gate;
use crate::fln;
use crate::gate_app::util::send_cmd_res_all;
use crate::gate_app::util::send_cmd_res_changed;
use crate::gate_app::util::stream_write_all;
use crate::gate_app::util::vec_to_hex;
use crate::gate_app::GateCmdRsltType;
use crate::gate_app::{GateCmd, GateCmdType, GateStatus};
use crate::models::cd::DoGateCmdRslt;
use crate::models::cd::ElockStatus;
use crate::GateCtx;
use log::error;
use std::vec;
use tokio::{io::AsyncReadExt, net::TcpStream};

mod cmd_auto_close;
mod cmd_close;
mod cmd_close_async;
mod cmd_elock;
mod cmd_eunlock;
mod cmd_open;
mod cmd_open_async;
mod cmd_stat;
mod cmd_stop;

async fn recv_cmd_res(ctx: &GateCtx, stream: &mut TcpStream, cmd: &GateCmd) -> (GateCmdRsltType, Vec<u8>) {
  let mut buf: [u8; 1] = [0; 1];
  let mut all: Vec<u8> = vec![];
  let mut rslt = GateCmdRsltType::Success;
  loop {
    let ret = tokio::time::timeout(tokio::time::Duration::from_millis(5000), stream.read(&mut buf)).await;
    if let Err(e) = ret {
      error!("[ITSON] read timeout {e:?}");
      rslt = GateCmdRsltType::Fail;
      let msg = format!("{rslt:?}");
      let stat = GateStatus::Na;
      send_cmd_res_all(ctx, cmd, rslt, stat, msg).await;
      break;
    }
    let ret = ret.unwrap();
    if let Err(e) = ret {
      error!("[ITSON] read error {e:?}");
      rslt = GateCmdRsltType::Fail;
      let msg = format!("{rslt:?}");
      let stat = GateStatus::Na;
      send_cmd_res_all(ctx, cmd, rslt, stat, msg).await;
      break;
    }
    let ok = ret.unwrap();
    if ok == 0 {
      log::error!("[ITSON] receive size is 0");
      break;
    }
    all.append(&mut buf[0..ok].to_vec());
    if all.len() == pkt::PKT_LEN {
      break;
    }
  }
  if all.len() != pkt::PKT_LEN {
    // 02..03 - 3보다 작을 수 없음.
    error!("[ITSON] all is under 3 => {}", all.len());
    return (rslt, all);
  }

  return (rslt, all);
}

async fn recv_cmd_res_changed(
  ctx: &GateCtx,
  stream: &mut TcpStream,
  model: &tb_gate::Model,
  cmd: &GateCmd,
) -> (GateCmdRsltType, Vec<u8>) {
  let mut buf: [u8; 1] = [0; 1];
  let mut all: Vec<u8> = vec![];
  let mut rslt = GateCmdRsltType::Success;
  loop {
    let ret = tokio::time::timeout(tokio::time::Duration::from_millis(5000), stream.read(&mut buf)).await;
    if let Err(e) = ret {
      error!("[ITSON] read timeout {e:?}");
      rslt = GateCmdRsltType::Fail;
      let msg = format!("{rslt:?}");
      let stat = GateStatus::Na;
      send_cmd_res_changed(ctx, model, cmd, rslt, stat, msg).await;
      break;
    }
    let ret = ret.unwrap();
    if let Err(e) = ret {
      error!("[ITSON] read error {e:?}");
      rslt = GateCmdRsltType::Fail;
      let msg = format!("{rslt:?}");
      let stat = GateStatus::Na;
      send_cmd_res_changed(ctx, model, cmd, rslt, stat, msg).await;
      break;
    }
    let ok = ret.unwrap();
    if ok == 0 {
      log::error!("[ITSON] receive size is 0");
      break;
    }
    all.append(&mut buf[0..ok].to_vec());
    if all.len() == pkt::PKT_LEN {
      break;
    }
  }
  if all.len() != pkt::PKT_LEN {
    // 02..03 - 3보다 작을 수 없음.
    error!("[ITSON] all is under 3 => {}", all.len());
    return (rslt, all);
  }

  return (rslt, all);
}
async fn is_ack(ctx: &GateCtx, cmd: &GateCmd, res: &Vec<u8>) -> bool {
  if pkt::is_cmd_ack(res) {
    return true;
  }

  let rslt = GateCmdRsltType::Fail;
  let msg = format!("[ITSON] not ack {}", vec_to_hex(res));
  let stat = GateStatus::Na;

  send_cmd_res_all(ctx, cmd, rslt, stat, msg).await;
  false
}

async fn is_ack_changed(ctx: &GateCtx, model: &tb_gate::Model, cmd: &GateCmd, res: &Vec<u8>) -> bool {
  if pkt::is_cmd_ack(res) {
    return true;
  }

  let rslt = GateCmdRsltType::Fail;
  let msg = format!("[ITSON] not ack {}", vec_to_hex(res));
  let stat = GateStatus::Na;

  send_cmd_res_changed(ctx, model, cmd, rslt, stat, msg).await;
  false
}
async fn get_gate_status(ctx: &GateCtx, stream: &mut TcpStream, cmd: &GateCmd) -> (GateCmdRsltType, GateStatus, ElockStatus) {
  let sbytes = pkt::get_cmd_status();
  if !stream_write_all(ctx, stream, &sbytes, cmd).await {
    return (GateCmdRsltType::Fail, GateStatus::Na, ElockStatus::Na);
  };
  let (code, res) = recv_cmd_res(ctx, stream, cmd).await;
  if code != GateCmdRsltType::Success {
    log::error!("{code:?} {res:?}");
    return (GateCmdRsltType::Fail, GateStatus::Na, ElockStatus::Na);
  }
  if !is_ack(ctx, cmd, &res).await {
    log::error!("[ITSON] res is snot ack {res:?}");
    return (GateCmdRsltType::Fail, GateStatus::Na, ElockStatus::Na);
  }

  let (code, res) = recv_cmd_res(ctx, stream, cmd).await;
  if code != GateCmdRsltType::Success {
    log::error!("{code:?} {res:?}");
    return (GateCmdRsltType::Fail, GateStatus::Na, ElockStatus::Na);
  }

  // 성공시에 상태값 파싱한것.
  let stat = res[3];
  let status = super::pkt::get_gate_status(stat);
  let elock = super::pkt::get_elock_status(res[8]);
  log::debug!("[ITSON] status res {}", vec_to_hex(&res));

  (GateCmdRsltType::Success, status, elock)
}

async fn get_gate_status_changed(
  ctx: &GateCtx,
  stream: &mut TcpStream,
  model: &tb_gate::Model,
  cmd: &GateCmd,
) -> (GateCmdRsltType, GateStatus, ElockStatus) {
  let sbytes = pkt::get_cmd_status();
  if !stream_write_all(ctx, stream, &sbytes, cmd).await {
    return (GateCmdRsltType::Fail, GateStatus::Na, ElockStatus::Na);
  };
  let (code, res) = recv_cmd_res_changed(ctx, stream, model, cmd).await;
  if code != GateCmdRsltType::Success {
    log::error!("{code:?} {res:?}");
    return (GateCmdRsltType::Fail, GateStatus::Na, ElockStatus::Na);
  }
  if !is_ack_changed(ctx, model, cmd, &res).await {
    log::error!("[ITSON] res is snot ack {res:?}");
    return (GateCmdRsltType::Fail, GateStatus::Na, ElockStatus::Na);
  }

  let (code, res) = recv_cmd_res_changed(ctx, stream, model, cmd).await;
  if code != GateCmdRsltType::Success {
    log::error!("{code:?} {res:?}");
    return (GateCmdRsltType::Fail, GateStatus::Na, ElockStatus::Na);
  }

  // 성공시에 상태값 파싱한것.
  let stat = res[3];
  let status = super::pkt::get_gate_status(stat);
  let elock = super::pkt::get_elock_status(res[8]);
  log::debug!("[ITSON] status res {}", vec_to_hex(&res));

  (GateCmdRsltType::Success, status, elock)
}

pub async fn do_cmd(
  ctx: &GateCtx,
  model: &tb_gate::Model,
  stream: &mut TcpStream,
  cmd: &GateCmd,
) -> anyhow::Result<DoGateCmdRslt> {
  if cmd.cmd_type == GateCmdType::Up {
    return cmd_open::do_cmd_open(ctx, stream, cmd).await;
  } else if cmd.cmd_type == GateCmdType::UpAsync {
    return cmd_open_async::do_cmd_open_async(ctx, stream, cmd).await;
  } else if cmd.cmd_type == GateCmdType::Down {
    return cmd_close::do_cmd_close(ctx, model, stream, cmd).await;
  } else if cmd.cmd_type == GateCmdType::DownAsync {
    return cmd_close_async::do_cmd_close_async(ctx, model, stream, cmd).await;
  } else if cmd.cmd_type == GateCmdType::AutoDown {
    return cmd_auto_close::do_cmd_auto_close(ctx, model, stream, cmd).await;
  } else if cmd.cmd_type == GateCmdType::Stat {
    return cmd_stat::do_cmd_stat(ctx, model, stream, cmd).await;
  } else if cmd.cmd_type == GateCmdType::Stop {
    return cmd_stop::do_cmd_stop(ctx, stream, cmd).await;
  } else if cmd.cmd_type == GateCmdType::ELock {
    return cmd_elock::do_cmd_elock(ctx, model, stream, cmd).await;
  } else if cmd.cmd_type == GateCmdType::EUnLock {
    return cmd_eunlock::do_cmd_eunlock(ctx, model, stream, cmd).await;
  }

  let cmdmsg = cmd.msg.clone().unwrap_or("".to_owned());
  let msg = format!("[ITSON] Unknown Cmd Type {:?}{cmdmsg}", cmd.cmd_type);
  log::error!("{}", msg);

  send_cmd_res(&cmd, GateCmdRsltType::Fail, GateStatus::Na, msg.clone()).await;
  Err(anyhow::anyhow!(fln!(msg)))
}
