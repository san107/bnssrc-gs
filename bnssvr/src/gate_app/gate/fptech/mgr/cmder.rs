use crate::entities::tb_gate;
use crate::gate_app::gate::fptech::cmd_stat_info;
use crate::gate_app::gate::fptech::pkt;
use crate::gate_app::util::ws_send_gate_stat_all;
use crate::gate_app::GateCmdRsltType;
use crate::gate_app::GateStatus;
use crate::GateCtx;
use log::debug;
use std::vec;
use tokio::net::TcpStream;

async fn mgr_get_gate_status(stream: &mut TcpStream) -> (GateCmdRsltType, GateStatus, String) {
  let mut pkt = pkt::Pkt::new_stat();
  pkt.cmd = pkt::Cmd::StatInfo;
  pkt.data = vec![0x80];

  let rslt = pkt.send_pkt(stream).await;

  if let Err(e) = rslt {
    log::error!("[데몬] write error {e:?}");
    return (GateCmdRsltType::Fail, GateStatus::Na, e.to_string());
  }
  let pkt = pkt::Pkt::recv_pkt(stream).await;
  if let Err(e) = pkt {
    log::error!("[데몬] recv error {e:?}");
    return (GateCmdRsltType::Fail, GateStatus::Na, e.to_string());
  }
  let pkt = pkt.unwrap();

  let rslt = cmd_stat_info::CmdStatInfoRes::from_bytes(&pkt.data);
  if let Err(e) = rslt {
    log::error!("[데몬] pkt from bytes error {e:?}");
    return (GateCmdRsltType::Fail, GateStatus::Na, e.to_string());
  }

  let status = rslt.unwrap().gate_status();

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
