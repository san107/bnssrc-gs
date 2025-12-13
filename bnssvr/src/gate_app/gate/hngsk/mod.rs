use crate::entities::tb_gate;
use crate::err;
use crate::flnf;
use crate::gate_app::gate;
use crate::gate_app::util::send_cmd_res_all;
use crate::gate_app::util::send_cmd_res_changed;
use crate::gate_app::GateCmd;
use crate::models::cd::GateCmdType;
use crate::models::cd::{DoGateCmdRslt, GateCmdRsltType, GateStatus};
use crate::GateCtx;
use log::debug;
use tokio_modbus::prelude::*;

mod cmder;
pub mod mgr;
mod pkt;
mod util;

pub async fn do_cmd(ctx: GateCtx, model: tb_gate::Model, cmd: GateCmd) -> anyhow::Result<DoGateCmdRslt> {
  // 소켓으로 전송하고 나서, 이 결과를 처리할 것.

  let seq = model.gate_seq;
  let cmdmsg = cmd.msg.clone().unwrap_or("".to_owned());

  let straddr = format!("{}:{}", model.gate_ip, model.gate_port);

  let modbus = gate::sock::do_connect(&straddr).await;

  if let Err(e) = modbus {
    let msg = flnf!("[HNGSK] 연결 에러 seq is {seq}{cmdmsg}");
    let stat = GateStatus::Na;
    let rslt = GateCmdRsltType::Fail;
    if cmd.cmd_type != GateCmdType::Stat {
      send_cmd_res_changed(&ctx, &model, &cmd, rslt, stat, msg.clone()).await;
    } else {
      send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
    }
    return Err(err!(e, msg));
  }
  debug!("[HNGSK] addr is {modbus:?}{cmdmsg}");

  let mut modbus = modbus.unwrap();

  // let gateidx = util::get_gate_idx(&model.gate_no);
  // let addr = pkt::BASE_ADDR + gateidx * 2; // read, write address pair ==> * 2
  // log::debug!("[HNGSK] addr is {addr}");

  // let data = gate::sock::do_read_input_registers(&mut modbus, addr, 1).await;

  // if let Err(e) = data {
  //   let msg = flnf!("[HNGSK] 읽기 에러 seq is {seq}{cmdmsg}");
  //   let stat = GateStatus::Na;
  //   let rslt = GateCmdRsltType::Fail;
  //   if cmd.cmd_type != GateCmdType::Stat {
  //     send_cmd_res_changed(&ctx, &model, &cmd, rslt, stat, msg.clone()).await;
  //   } else {
  //     send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
  //   }
  //   return Err(err!(e, msg));
  // }

  // let data = data.unwrap();

  // debug!("[HNGSK] read data is {:?} {} {cmdmsg}", data, vec_to_hex_u16(&data));
  // if data.len() > 0 {
  //   log::debug!(
  //     "[HNGSK] addr is {addr} data is {} {cmdmsg}",
  //     pkt::parse(data.get(0).unwrap().clone()).join(",")
  //   );
  // }
  //crate::util::sleep(100).await; // 연결 후, 0.1초 delay.
  let rlt = cmder::do_cmd(&ctx, &model, &mut modbus, &cmd).await;

  modbus.disconnect().await.unwrap();
  rlt
}
