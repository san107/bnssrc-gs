use std::net::ToSocketAddrs;

use crate::entities::tb_gate;
use crate::gate_app::doori::pkt;
use crate::gate_app::util::ws_send_gate_stat_all;
use crate::models::cd::{GateCmdRsltType, GateStatus};
use crate::GateCtx;
use log::debug;
use tokio_modbus::prelude::*;

mod cmder;

pub async fn mgr_get_status(ctx: GateCtx, model: tb_gate::Model) {
  let seq = model.gate_seq;

  let straddr = format!("{}:{}", model.gate_ip, model.gate_port);

  let addr = straddr.to_socket_addrs();
  if let Err(e) = addr {
    let msg = format!("[데몬] 소켓 생성실패 {e:?} seq is {seq} {straddr}");
    let stat = GateStatus::Na;
    let rslt = GateCmdRsltType::Fail;
    if model.gate_stat == Some(stat.to_string()) && model.cmd_rslt == Some(rslt.to_string()) {
      debug!("[데몬] 이미 상태가 동일함. {stat:?} {rslt:?}");
      return;
    }
    ws_send_gate_stat_all(&ctx, model.gate_seq, stat, rslt, msg.clone()).await;
    return;
  }
  let addr = addr.unwrap();
  let addr = addr.filter(|ele| if ele.is_ipv4() { true } else { false }).next();
  if addr.is_none() {
    let msg = format!("[데몬] 소켓 주소 없음 seq is {seq} {straddr}");
    let stat = GateStatus::Na;
    let rslt = GateCmdRsltType::Fail;
    if model.gate_stat == Some(stat.to_string()) && model.cmd_rslt == Some(rslt.to_string()) {
      debug!("[데몬] 이미 상태가 동일함. {stat:?} {rslt:?}");
      return;
    }
    ws_send_gate_stat_all(&ctx, model.gate_seq, stat, rslt, msg.clone()).await;
    return;
  }

  let addr = addr.unwrap();
  debug!("[데몬] addr is {addr:?}");

  let mut modbus = match tokio::time::timeout(tokio::time::Duration::from_millis(8000), tcp::connect_slave(addr, Slave(1))).await
  {
    Ok(r) => match r {
      Ok(s) => s,
      Err(e) => {
        let msg = format!("[데몬] 소켓 연결실패 {e:?}");
        let rslt = GateCmdRsltType::Fail;
        let stat = GateStatus::Na;
        if model.gate_stat == Some(stat.to_string()) && model.cmd_rslt == Some(rslt.to_string()) {
          debug!("[데몬] 이미 상태가 동일함. {stat:?} {rslt:?}");
          return;
        }
        ws_send_gate_stat_all(&ctx, model.gate_seq, stat, rslt, msg.clone()).await;
        return;
      }
    },
    Err(e) => {
      let msg = format!("[데몬] 소켓 연결실패 timeout {e:?}");
      let rslt = GateCmdRsltType::Fail;
      let stat = GateStatus::Na;
      if model.gate_stat == Some(stat.to_string()) && model.cmd_rslt == Some(rslt.to_string()) {
        debug!("[데몬] 이미 상태가 동일함. {stat:?} {rslt:?}");
        return;
      }
      ws_send_gate_stat_all(&ctx, model.gate_seq, stat, rslt, msg.clone()).await;
      return;
    }
  };

  let addr = pkt::CMD_ADDR_STAT;
  let data = modbus.read_coils(addr, 4).await;
  if let Err(e) = data {
    let msg = format!("[데몬] read_coils fail {e:?}");
    log::error!("{msg}");
    let rslt = GateCmdRsltType::Fail;
    let stat = GateStatus::Na;
    if model.gate_stat == Some(stat.to_string()) && model.cmd_rslt == Some(rslt.to_string()) {
      debug!("[데몬] 이미 상태가 동일함. {stat:?} {rslt:?}");
      return;
    }
    ws_send_gate_stat_all(&ctx, model.gate_seq, stat, rslt, msg.clone()).await;
    return;
  }
  let data = data.unwrap();
  if let Err(e) = data {
    let msg = format!("[데몬] read_coils fail {e:?}");
    log::error!("{msg}");
    let rslt = GateCmdRsltType::Fail;
    let stat = GateStatus::Na;
    if model.gate_stat == Some(stat.to_string()) && model.cmd_rslt == Some(rslt.to_string()) {
      debug!("[데몬] 이미 상태가 동일함. {stat:?} {rslt:?}");
      return;
    }
    ws_send_gate_stat_all(&ctx, model.gate_seq, stat, rslt, msg.clone()).await;
    return;
  }
  let data = data.unwrap();

  debug!("[데몬] read data is {:?}", data);

  cmder::mgr_do_stat(&ctx, &model, &mut modbus).await;

  modbus.disconnect().await.unwrap();
  log::info!("[데몬] seq is {seq} 완료")
}
