use super::pkt;
use crate::{
  eanyhow,
  entities::tb_gate,
  fln,
  gate_app::{
    gate::{self, yesung::pkt::get_yesung_clear_cmd},
    tx_gate,
    util::send_cmd_res_all,
    GateCmd, GateCmdGateDown,
  },
  models::cd::{DoGateCmdRslt, GateCmdRsltType, GateStatus},
  GateCtx,
};
use tokio_modbus::client::Context;

pub async fn do_cmd_down_async(
  ctx: &GateCtx,
  model: &tb_gate::Model,
  modbus: &mut Context,
  cmd: &GateCmd,
) -> anyhow::Result<DoGateCmdRslt> {
  let modbuscmd = pkt::get_yesung_down_cmd();
  let modbuscmd = vec![modbuscmd];

  let down_addr = super::super::util::get_write_down_addr(&model.gate_no);
  log::debug!("[yesung] DOWN_ASYNC addr={} cmd={:?}", down_addr, modbuscmd);

  // 먼저 상태 확인
  let (rslt, stat, msg) = super::get_status(ctx, 0, modbus, cmd, false).await;
  if let GateCmdRsltType::Fail = rslt {
    log::error!("status fail {msg}");
    return Err(eanyhow!(fln!(msg)));
  }

  // P03에 1 쓰기
  let rslt = gate::sock::do_write_multiple_registers(modbus, down_addr, &modbuscmd).await;
  if let Err(e) = rslt {
    let msg = format!("[yesung] DOWN_ASYNC write error {e:?}");
    log::error!("{msg}");
    let rslt = GateCmdRsltType::Fail;
    let stat = GateStatus::Na;
    send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
    return Err(anyhow::anyhow!(fln!(msg)));
  }

  // 하강 진행중 처리
  tx_gate::send_gate_cmd(Box::new(GateCmdGateDown {
    gate_seq: cmd.gate_seq,
    gate: model.clone(),
  }))
  .await;

  crate::util::sleep(2000).await;

  // P03에 0 쓰기
  let rslt = gate::sock::do_write_multiple_registers(modbus, down_addr, &get_yesung_clear_cmd()).await;
  if let Err(e) = rslt {
    let msg = format!("[yesung] DOWN_ASYNC clear error {e:?}");
    log::error!("{msg}");
    let rslt = GateCmdRsltType::Fail;
    let stat = GateStatus::Na;
    send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
    return Err(anyhow::anyhow!(fln!(msg)));
  }

  log::info!("[yesung] down_async success (seq:{})", model.gate_seq);
  send_cmd_res_all(&ctx, &cmd, GateCmdRsltType::Success, stat, String::new()).await;
  Ok(DoGateCmdRslt::Success)
}
