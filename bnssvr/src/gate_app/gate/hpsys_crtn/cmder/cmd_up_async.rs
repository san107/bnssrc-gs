use super::pkt;
use crate::{
  entities::tb_gate,
  fln,
  gate_app::{
    gate::cmd_lock,
    util::{get_sock_addr, send_cmd_res_all, PLUS_SLEEP},
    GateCmd,
  },
  models::cd::{DoGateCmdRslt, GateCmdRsltType, GateStatus},
  GateCtx,
};
use tokio_modbus::client::{Context, Writer};

pub async fn do_cmd_up_async(
  ctx: &GateCtx,
  model: &tb_gate::Model,
  modbus: &mut Context,
  cmd: &GateCmd,
) -> anyhow::Result<DoGateCmdRslt> {
  let modbuscmd = pkt::get_hpsys_crtn_up_cmd();

  let addr = super::super::util::get_gate_addr(&model.gate_no);
  log::debug!("[HPCRTN] addr is {addr}");

  let (rslt, stat, msg) = super::get_status_changed(ctx, addr, modbus, model, cmd).await;
  if rslt == GateCmdRsltType::Fail {
    // 실패의 경우에는 안에서 처리함.
    return Err(anyhow::anyhow!(fln!(msg)));
  }

  let lock = cmd_lock::mutex(&get_sock_addr(&model)).await;
  let lock = lock.lock().await;

  let rslt = modbus.write_single_register(addr + 1, modbuscmd).await;
  if let Err(e) = rslt {
    //실패.
    let msg = format!("[HPCRTN] modbus write errro {e:?}");
    log::error!("{msg}");
    let rslt = GateCmdRsltType::Fail;
    let stat = GateStatus::Na;
    send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
    return Err(anyhow::anyhow!(fln!(msg)));
  }

  crate::util::sleep(PLUS_SLEEP).await;

  let rslt = modbus.write_single_register(addr + 1, 0).await;

  drop(lock); // lock 해제.
  if let Err(e) = rslt {
    //실패.
    let msg = format!("[HPCRTN] modbus write errro {e:?}");
    log::error!("{msg}");
    let rslt = GateCmdRsltType::Fail;
    let stat = GateStatus::Na;
    send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
    return Err(anyhow::anyhow!(fln!(msg)));
  }

  log::debug!("[HPCRTN] modbus write success... ");

  let rslt = GateCmdRsltType::Success;
  send_cmd_res_all(&ctx, &cmd, rslt, stat, "".to_owned()).await;

  Ok(DoGateCmdRslt::Success)
}
