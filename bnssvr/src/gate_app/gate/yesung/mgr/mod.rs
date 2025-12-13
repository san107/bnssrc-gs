use crate::entities::tb_gate;
use crate::gate_app::gate;
use crate::gate_app::util::vec_to_hex_u16;
use crate::gate_app::util::ws_send_gate_stat_all;
use crate::models::cd::{GateCmdRsltType, GateStatus};
use crate::GateCtx;
use log::debug;
use tokio_modbus::prelude::*;

mod cmder;

pub async fn mgr_get_status(ctx: GateCtx, model: tb_gate::Model) {
  let seq = model.gate_seq;

  let straddr = format!("{}:{}", model.gate_ip, model.gate_port);

  let modbus = gate::sock::do_connect(&straddr).await;
  if let Err(e) = modbus {
    let msg = format!("[데몬] 연결 에러 {e:?} seq is {seq} {straddr}");
    let stat = GateStatus::Na;
    let rslt = GateCmdRsltType::Fail;
    if model.gate_stat == Some(stat.to_string()) && model.cmd_rslt == Some(rslt.to_string()) {
      debug!("[데몬] 이미 상태가 동일함. {stat:?} {rslt:?}");
      return;
    }
    ws_send_gate_stat_all(&ctx, model.gate_seq, stat, rslt, msg.clone()).await;
    return;
  }

  let mut modbus = modbus.unwrap();

  //let addr = super::util::get_gate_addr(&model.gate_no);
  //let data = gate::sock::do_read_input_registers(&mut modbus, addr, 1).await;

  let read_addr = super::util::get_read_addr(&model.gate_no);

  let data = gate::sock::do_read_input_registers(modbus, read_addr, 1).await;
  if let Err(e) = data {
    let msg = format!("[데몬] read_holding_registers fail {e:?}");
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

  debug!("[데몬] read data is {:?} {}", data, vec_to_hex_u16(&data));
  if data.len() > 0 {
    log::debug!(
      "[데몬] addr {read_addr} {}",
      super::pkt::parse(data.get(0).unwrap().clone()).join(",")
    );
  }

  //crate::util::sleep(100).await; // 연결 후, 0.1초 delay.

  cmder::mgr_do_stat(&ctx, &model, &mut modbus).await;

  modbus.disconnect().await.unwrap();
  log::info!("[데몬] seq is {seq} 완료")
}
