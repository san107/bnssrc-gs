use super::{GateCmdRsltType, GateStatus};
use crate::gate_app::util::ws_send_gate_stat_all;
use crate::{entities::tb_gate, sock};
use crate::{flnf, GateCtx};
use log::debug;

mod cmder;

// 데몬 동작.
pub async fn mgr_get_status(ctx: GateCtx, model: tb_gate::Model) {
  // 상태정보 전송하도록.

  let addr = sock::conn::connect(&model.gate_ip, model.gate_port).await;

  if let Err(e) = addr {
    let msg = flnf!("[데몬] 연결 에러 {e:?}");
    let stat = GateStatus::Na;
    let rslt = GateCmdRsltType::Fail;
    if model.gate_stat == Some(stat.to_string()) && model.cmd_rslt == Some(rslt.to_string()) {
      debug!("{msg} 이미 상태가 동일함. {stat:?} {rslt:?}");
      return;
    }
    ws_send_gate_stat_all(&ctx, model.gate_seq, stat, rslt, msg.clone()).await;
    return;
  }
  let mut stream = addr.unwrap();
  //crate::util::sleep(100).await; // 연결 후, 0.1초 delay.
  cmder::mgr_get_status(&mut stream, &ctx, &model).await;
}
