use super::pkt;
use crate::{
  eanyhow,
  entities::tb_gate,
  fln,
  gate_app::{
    gate::{self, yesung::pkt::get_yesung_clear_cmd},
    util::send_cmd_res_all,
    GateCmd,
  },
  models::cd::{DoGateCmdRslt, GateCmdRsltType, GateStatus},
  GateCtx,
};
use tokio_modbus::client::Context;

pub async fn do_cmd_stop(
  ctx: &GateCtx,
  model: &tb_gate::Model,
  modbus: &mut Context,
  cmd: &GateCmd,
) -> anyhow::Result<DoGateCmdRslt> {
  let modbuscmd = pkt::get_yesung_stop_cmd();
  let modbuscmd = vec![modbuscmd];

  let stop_addr = super::super::util::get_write_stop_addr(&model.gate_no);
  log::debug!("[yesung] STOP addr={}", stop_addr);

  // 상태 확인
  let (rslt, stat, msg) = super::get_status(ctx, 0, modbus, cmd, false).await;
  if let GateCmdRsltType::Fail = rslt {
    log::error!("status fail {msg}");
    return Err(eanyhow!(fln!(msg)));
  }

  // P04에 1 쓰기
  let rslt = gate::sock::do_write_multiple_registers(modbus, stop_addr, &modbuscmd).await;
  if let Err(e) = rslt {
    let msg = format!("[yesung] STOP write error {e:?}");
    log::error!("{msg}");
    let rslt = GateCmdRsltType::Fail;
    let stat = GateStatus::Na;
    send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
    return Err(anyhow::anyhow!(fln!(msg)));
  }

  crate::util::sleep(2000).await;

  // P04에 0 쓰기
  let rslt = gate::sock::do_write_multiple_registers(modbus, stop_addr, &get_yesung_clear_cmd()).await;
  if let Err(e) = rslt {
    let msg = format!("[yesung] STOP clear error {e:?}");
    log::error!("{msg}");
    let rslt = GateCmdRsltType::Fail;
    let stat = GateStatus::Na;
    send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
    return Err(anyhow::anyhow!(fln!(msg)));
  }

  log::info!("[yesung] STOP success (seq:{})", model.gate_seq);
  send_cmd_res_all(&ctx, &cmd, GateCmdRsltType::Success, stat, String::new()).await;
  Ok(DoGateCmdRslt::Success)
}
