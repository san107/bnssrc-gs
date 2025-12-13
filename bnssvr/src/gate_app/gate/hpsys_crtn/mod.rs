use crate::entities::tb_gate;
use crate::fln;
use crate::gate_app::modbus;
use crate::gate_app::util::send_cmd_res_all;
use crate::gate_app::util::send_cmd_res_changed;
use crate::gate_app::GateCmd;
use crate::models::cd::GateCmdType;
use crate::models::cd::{DoGateCmdRslt, GateCmdRsltType, GateStatus};
use crate::GateCtx;
use tokio_modbus::prelude::*;

mod cmder;
pub mod mgr;
mod pkt;
mod util;

pub async fn do_cmd(ctx: GateCtx, model: tb_gate::Model, cmd: GateCmd) -> anyhow::Result<DoGateCmdRslt> {
  // 소켓으로 전송하고 나서, 이 결과를 처리할 것.

  let seq = model.gate_seq;
  let ip = model.gate_ip.as_str();
  let port = model.gate_port;

  let modbbus = modbus::conn::connect(model.gate_ip.as_str(), model.gate_port).await;
  if let Err(e) = modbbus {
    let msg = format!("[HPCRTN] 소켓 연결실패 {e:?} seq is {seq} {ip}:{port}");
    let rslt = GateCmdRsltType::Fail;
    let stat = GateStatus::Na;
    if cmd.cmd_type == GateCmdType::Stat {
      send_cmd_res_changed(&ctx, &model, &cmd, rslt, stat, msg.clone()).await;
    } else {
      send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
    }
    return Err(anyhow::anyhow!(fln!(msg)));
  }

  let mut modbus = modbbus.unwrap();

  //crate::util::sleep(100).await; // 연결 후, 0.1초 delay.
  let rlt = cmder::do_cmd(&ctx, &model, &mut modbus, &cmd).await;

  modbus.disconnect().await.unwrap();
  rlt
}
