use crate::entities::tb_gate;
use crate::gate_app::util::{send_cmd_res_all, send_cmd_res_changed};
use crate::gate_app::{modbus, GateCmd};
use crate::models::cd::{DoGateCmdRslt, GateCmdRsltType, GateStatus};
use crate::{fln, GateCtx};
use std::str::FromStr;
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

  let stat = GateStatus::from_str(model.gate_stat.clone().as_ref().unwrap_or(&"Na".to_owned())).unwrap_or(GateStatus::Na);

  let modbus = modbus::conn::connect(&model.gate_ip, model.gate_port).await;
  if let Err(e) = modbus {
    let msg = format!("[SYSBASE] 모드버스 연결실패 {e:?} seq is {seq}");
    let rslt = GateCmdRsltType::Fail;

    if model.cmd_rslt == Some(rslt.to_string()) {
      send_cmd_res_changed(&ctx, &model, &cmd, rslt, stat, msg.clone()).await;
    } else {
      send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
    }
    return Err(anyhow::anyhow!(fln!(msg)));
  }

  let mut modbus = modbus.unwrap();

  let rlt = cmder::do_cmd(&ctx, &model, &mut modbus, &cmd).await;

  match modbus.disconnect().await {
    Ok(_r) => {
      // debug!("[DOORI] 소켓 연결 해제 {r:?}{cmdmsg}");
    }
    Err(e) => {
      log::error!("[SYSBASE] 소켓 연결 해제 실패 {e:?} seq is {seq}");
    }
  }

  rlt
}
