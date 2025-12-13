use crate::{
  entities::tb_gate,
  gate_app::{
    util::{send_cmd_res_if, ws_send_gate_stat},
    GateCmd, IfGateCmdResDoori,
  },
  models::cd::{GateCmdRsltType, GateStatus},
  svc::gate::{svc_gate, svc_gate_hist},
  GateCtx,
};

use super::pkt::{DooriAutoMan, DooriRemLoc, DooriWindMode};

pub fn get_cmd_timeout_secs() -> u64 {
  50
}

pub async fn doori_send_cmd_res_changed(
  ctx: &GateCtx,
  model: &tb_gate::Model,
  cmd: &GateCmd,
  rslt: GateCmdRsltType,
  stat: GateStatus,
  msg: String,
  automan: DooriAutoMan,
  remloc: DooriRemLoc,
  wind: DooriWindMode,
) {
  let is_changed = model.gate_stat != Some(stat.to_string()) || model.cmd_rslt != Some(rslt.to_string());
  if is_changed {
    // gate상태, cmd_rslt 업데이트함.
    svc_gate::mtn::Mtn::update_stat_ignr_rslt(&ctx.conn, cmd.gate_seq, stat, rslt).await;
    // 히스토리 저장.
    svc_gate_hist::mtn::Mtn::save_stat_ignr_rslt(&ctx.conn, cmd.gate_seq, stat, cmd.cmd_type, rslt, Some(msg.clone())).await;
    ws_send_gate_stat(&ctx.tx_ws, cmd.gate_seq, stat, rslt, msg.clone()).await;
  }

  send_cmd_res_if(
    cmd,
    Box::from(IfGateCmdResDoori {
      cmd_res: rslt,
      cmd_res_msg: msg.clone(),
      gate_status: stat,
      auto_man: automan,
      rem_loc: remloc,
      wind_mode: wind,
    }),
  )
  .await;
}

pub async fn doori_send_cmd_res_all(
  ctx: &GateCtx,
  cmd: &GateCmd,
  rslt: GateCmdRsltType,
  stat: GateStatus,
  msg: String,
  automan: DooriAutoMan,
  remloc: DooriRemLoc,
  wind: DooriWindMode,
) {
  // gate상태, cmd_rslt 업데이트함.
  svc_gate::mtn::Mtn::update_stat_ignr_rslt(&ctx.conn, cmd.gate_seq, stat, rslt).await;
  // 히스토리 저장.
  svc_gate_hist::mtn::Mtn::save_stat_ignr_rslt(&ctx.conn, cmd.gate_seq, stat, cmd.cmd_type, rslt, Some(msg.clone())).await;
  ws_send_gate_stat(&ctx.tx_ws, cmd.gate_seq, stat, rslt, msg.clone()).await;

  send_cmd_res_if(
    cmd,
    Box::from(IfGateCmdResDoori {
      cmd_res: rslt,
      cmd_res_msg: msg.clone(),
      gate_status: stat,
      auto_man: automan,
      rem_loc: remloc,
      wind_mode: wind,
    }),
  )
  .await;
}
