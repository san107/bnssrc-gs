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

pub async fn do_cmd_up_async(
  ctx: &GateCtx,
  model: &tb_gate::Model,
  modbus: &mut Context,
  cmd: &GateCmd,
) -> anyhow::Result<DoGateCmdRslt> {
  let modbuscmd = pkt::get_yesung_up_cmd();
  let modbuscmd = vec![modbuscmd];

  let addr = super::super::util::get_gate_addr(&model.gate_no);
  let write_addr = super::super::util::get_write_addr(&model.gate_no);
  log::debug!("[yesung] addr is {addr}");

  let (rslt, stat, msg) = super::get_status(ctx, addr, modbus, cmd, false).await;

  if let GateCmdRsltType::Fail = rslt {
    log::error!("status fail {msg}");
    return Err(eanyhow!(fln!(msg)));
  }

  let rslt = gate::sock::do_write_multiple_registers(modbus, write_addr, &modbuscmd).await;
  if let Err(e) = rslt {
    //실패.
    let msg = format!("[yesung] modbus write errro {e:?}");
    log::error!("{msg}");
    let rslt = GateCmdRsltType::Fail;
    let stat = GateStatus::Na;
    send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
    return Err(anyhow::anyhow!(fln!(msg)));
  }

  crate::util::sleep(2000).await;

  let rslt = gate::sock::do_write_multiple_registers(modbus, write_addr, &get_yesung_clear_cmd()).await;
  if let Err(e) = rslt {
    //실패.
    let msg = format!("[yesung] modbus write errro {e:?}");
    log::error!("{msg}");
    let rslt = GateCmdRsltType::Fail;
    let stat = GateStatus::Na;
    send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
    return Err(anyhow::anyhow!(fln!(msg)));
  }

  log::debug!("[yesung] up_async success(seq:{})", model.gate_seq);
  send_cmd_res_all(&ctx, &cmd, GateCmdRsltType::Success, stat, String::new()).await;
  Ok(DoGateCmdRslt::Success)
}
