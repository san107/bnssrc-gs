use crate::entities::tb_gate;
use crate::gate_app::util::ws_send_gate_stat_all;
use crate::gate_app::GateCmdRsltType;
use crate::gate_app::GateStatus;
use crate::GateCtx;
use log::debug;
use log::error;
use std::vec;
use tokio::io::AsyncWriteExt;
use tokio::{io::AsyncReadExt, net::TcpStream};

async fn mgr_recv_cmd_res(stream: &mut TcpStream) -> (GateCmdRsltType, Vec<u8>) {
  let mut buf: [u8; 1] = [0; 1];
  let mut all: Vec<u8> = vec![];
  let mut rslt = GateCmdRsltType::Success;
  loop {
    let ret = tokio::time::timeout(tokio::time::Duration::from_millis(5000), stream.read(&mut buf)).await;
    if let Err(e) = ret {
      error!("[데몬] read timeout {e:?}");
      rslt = GateCmdRsltType::Fail;
      break;
    }
    let ret = ret.unwrap();
    if let Err(e) = ret {
      error!("[데몬] read error {e:?}");
      rslt = GateCmdRsltType::Fail;
      break;
    }
    let ok = ret.unwrap();

    if ok == 0 {
      log::error!("[데몬] receive size is 0");
      break;
    }

    all.append(&mut buf[0..ok].to_vec());
    if all.len() == super::super::pkt::PKT_LEN {
      break;
    }
  }
  if all.len() != super::super::pkt::PKT_LEN {
    // 02..03 - 3보다 작을 수 없음.
    error!("[데몬] all is under 3 => {}", all.len());
    return (rslt, all);
  }

  return (rslt, all);
}

async fn mgr_is_ack(res: &Vec<u8>) -> bool {
  if super::super::pkt::is_cmd_ack(res) {
    return true;
  }

  false
}

async fn mgr_get_gate_status(stream: &mut TcpStream) -> (GateCmdRsltType, GateStatus, String) {
  let sbytes = super::super::pkt::get_cmd_status();
  if let Err(e) = stream.write(&sbytes).await {
    let msg = format!("[데몬] 소켓 fail {e:?}");
    log::error!("{msg}");
    return (GateCmdRsltType::Fail, GateStatus::Na, msg);
  }
  let (code, res) = mgr_recv_cmd_res(stream).await;
  if code != GateCmdRsltType::Success {
    let msg = format!("{code:?} {res:?}");
    log::error!("{msg}");
    return (GateCmdRsltType::Fail, GateStatus::Na, msg);
  }
  if !mgr_is_ack(&res).await {
    let msg = format!("[데몬] res is snot ack {res:?}");
    log::error!("{msg}");
    return (GateCmdRsltType::Fail, GateStatus::Na, msg);
  }

  let (code, res) = mgr_recv_cmd_res(stream).await;
  if code != GateCmdRsltType::Success {
    let msg = format!("[데몬] {code:?} {res:?}");
    log::error!("{msg}");
    return (GateCmdRsltType::Fail, GateStatus::Na, msg);
  }

  // 성공시에 상태값 파싱한것.
  let stat = res[3];
  let status = super::super::pkt::get_gate_status(stat);

  (GateCmdRsltType::Success, status, "[데몬]".to_owned())
}

// 상태 데몬에서 호출됨.
pub async fn mgr_get_status(stream: &mut TcpStream, ctx: &GateCtx, model: &tb_gate::Model) {
  //
  let (rslt, stat, msg) = mgr_get_gate_status(stream).await;

  if model.gate_stat == Some(stat.to_string()) && model.cmd_rslt == Some(rslt.to_string()) {
    debug!("[데몬] 이미 상태가 동일함. {stat:?} {rslt:?} {msg}");
    return;
  }
  ws_send_gate_stat_all(&ctx, model.gate_seq, stat, rslt, msg.clone()).await;
}
