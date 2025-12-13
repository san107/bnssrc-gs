use super::pkt;
use crate::{
  entities::tb_gate,
  fln,
  gate_app::{
    gate::cmd_lock,
    hpsys::pkt::get_hpsys_clear_cmd,
    util::{get_sock_addr, send_cmd_res_all, PLUS_SLEEP},
    GateCmd,
  },
  models::cd::{DoGateCmdRslt, GateCmdRsltType, GateStatus},
  GateCtx,
};
use tokio_modbus::client::{Context, Writer};

pub async fn do_cmd_side(
  ctx: &GateCtx,
  model: &tb_gate::Model,
  modbus: &mut Context,
  cmd: &GateCmd,
) -> anyhow::Result<DoGateCmdRslt> {
  let modbuscmd = pkt::get_hpsys_side_cmd();
  let modbuscmd = vec![modbuscmd];

  let addr = super::super::util::get_gate_addr(&model.gate_no);
  log::debug!("[HPSYS] addr is {addr}");

  let (rslt, stat, msg) = super::get_status_changed(ctx, addr, modbus, model, cmd).await;
  if rslt == GateCmdRsltType::Fail {
    // 실패의 경우에는 안에서 처리함.
    return Err(anyhow::anyhow!(fln!(msg)));
  }
  let lock = cmd_lock::mutex(&get_sock_addr(&model)).await;
  let lock = lock.lock().await;

  let rslt = modbus.write_multiple_registers(addr + 1, &modbuscmd).await;
  if let Err(e) = rslt {
    //실패.
    let msg = format!("[HPSYS] modbus write errro {e:?}");
    log::error!("{msg}");
    let rslt = GateCmdRsltType::Fail;
    let stat = GateStatus::Na;
    send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
    return Err(anyhow::anyhow!(fln!(msg)));
  }
  crate::util::sleep(PLUS_SLEEP).await;

  let rslt = modbus.write_multiple_registers(addr + 1, &get_hpsys_clear_cmd()).await;
  drop(lock); // lock 해제.
  if let Err(e) = rslt {
    //실패.
    let msg = format!("[HPSYS] modbus write errro {e:?}");
    log::error!("{msg}");
    let rslt = GateCmdRsltType::Fail;
    let stat = GateStatus::Na;
    send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
    return Err(anyhow::anyhow!(fln!(msg)));
  }

  log::debug!("[HPSYS] modbus write success... ");

  let rslt = GateCmdRsltType::Success;
  send_cmd_res_all(&ctx, &cmd, rslt, stat, "".to_owned()).await;

  Ok(DoGateCmdRslt::Success)
}
