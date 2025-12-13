use std::str::FromStr;

use crate::entities::tb_gate;
use crate::gate_app::util::ws_send_gate_stat_all;
use crate::models::cd::{GateCmdRsltType, GateStatus};
use crate::GateCtx;
use log::debug;
use tokio_modbus::client::Context;

pub async fn mgr_do_stat(ctx: &GateCtx, model: &tb_gate::Model, _modbus: &mut Context) {
  let rslt = GateCmdRsltType::Success;
  let stat = GateStatus::from_str(model.gate_stat.clone().as_ref().unwrap_or(&"Na".to_owned())).unwrap_or(GateStatus::Na);
  if model.gate_stat == Some(stat.to_string()) && model.cmd_rslt == Some(rslt.to_string()) {
    debug!("[데몬] 이미 상태가 동일함. {stat:?} {rslt:?}");
    return;
  }

  ws_send_gate_stat_all(&ctx, model.gate_seq, stat, rslt, "".to_owned()).await;
}
