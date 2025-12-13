use crate::entities::tb_gate;
use crate::gate_app::util::send_cmd_res_all;
use crate::gate_app::GateCmd;
use crate::models::cd::{DoGateCmdRslt, GateCmdRsltType, GateStatus};
use crate::{fln, GateCtx};
use log::debug;
use std::net::ToSocketAddrs;
use tokio_modbus::prelude::*;

mod cmder;
pub mod mgr;
pub mod pkt;
mod util;

/*
 * Doori Gate Command 시작함수.
 */
pub async fn do_cmd(ctx: GateCtx, model: tb_gate::Model, cmd: GateCmd) -> anyhow::Result<DoGateCmdRslt> {
  // 소켓으로 전송하고 나서, 이 결과를 처리할 것.

  let seq = model.gate_seq;
  let cmdmsg = cmd.msg.clone().unwrap_or("".to_owned());

  let straddr = format!("{}:{}", model.gate_ip, model.gate_port);

  let addr = straddr.to_socket_addrs();
  if let Err(e) = addr {
    let msg = format!("[DOORI] 소켓 생성실패 {e:?} seq is {seq}{cmdmsg} {straddr}");
    let stat = GateStatus::Na;
    let rslt = GateCmdRsltType::Fail;
    send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
    return Err(anyhow::anyhow!(fln!(msg)));
  }
  let addr = addr.unwrap();
  let addr = addr.filter(|ele| if ele.is_ipv4() { true } else { false }).next();
  if addr.is_none() {
    let msg = format!("[DOORI] 소켓 주소 없음 seq is {seq}{cmdmsg} {straddr}");
    let stat = GateStatus::Na;
    let rslt = GateCmdRsltType::Fail;
    send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
    return Err(anyhow::anyhow!(fln!(msg)));
  }
  let addr = addr.unwrap();
  debug!("[DOORI] addr is {addr:?}{cmdmsg}");

  let mut modbus = match tokio::time::timeout(tokio::time::Duration::from_millis(8000), tcp::connect_slave(addr, Slave(1))).await
  {
    Ok(r) => match r {
      Ok(s) => s,
      Err(e) => {
        let msg = format!("[DOORI] 소켓 연결실패 {e:?}{cmdmsg}");
        let rslt = GateCmdRsltType::Fail;
        let stat = GateStatus::Na;
        send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
        return Err(anyhow::anyhow!(fln!(msg)));
      }
    },
    Err(e) => {
      let msg = format!("[DOORI] 소켓 연결실패 timeout {e:?}{cmdmsg}");
      let rslt = GateCmdRsltType::Fail;
      let stat = GateStatus::Na;
      send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
      return Err(anyhow::anyhow!(fln!(msg)));
    }
  };

  let rlt = cmder::do_cmd(&ctx, &model, &mut modbus, &cmd).await;

  match modbus.disconnect().await {
    Ok(_r) => {
      // debug!("[DOORI] 소켓 연결 해제 {r:?}{cmdmsg}");
    }
    Err(e) => {
      log::error!("[DOORI] 소켓 연결 해제 실패 {e:?}{model:?}");
    }
  }

  rlt
}
