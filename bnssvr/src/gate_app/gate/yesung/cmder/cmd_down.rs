use super::pkt;
use crate::{
  entities::tb_gate,
  fln,
  gate_app::{
    gate::{
      self,
      yesung::{pkt::get_yesung_clear_cmd, util::get_cmd_timeout_secs},
    },
    tx_gate,
    util::{send_cmd_res_all, send_cmd_res_changed},
    GateCmd, GateCmdGateDown,
  },
  models::cd::{DoGateCmdRslt, GateCmdRsltType, GateStatus},
  GateCtx,
};
use tokio::time::{self, Instant};
use tokio_modbus::client::Context;

pub async fn do_cmd_down(
  ctx: &GateCtx,
  model: &tb_gate::Model,
  modbus: &mut Context,
  cmd: &GateCmd,
) -> anyhow::Result<DoGateCmdRslt> {
  
  let modbuscmd = pkt::get_yesung_down_cmd();
  let modbuscmd = vec![modbuscmd];

  let read_addr = super::super::util::get_read_addr(&model.gate_no);
  let write_addr = super::super::util::get_write_addr(&model.gate_no);
  log::debug!("[yesung] addr is {} cmd {:?}", write_addr, modbuscmd);

  let rslt = gate::sock::do_write_multiple_registers(modbus, write_addr, &modbuscmd).await;
  if let Err(e) = rslt {
    let msg = format!("[yesung] modbus write error {e:?}");
    log::error!("{msg}");
    let rslt = GateCmdRsltType::Fail;
    let stat = GateStatus::Na;
    send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
    return Err(anyhow::anyhow!(fln!(msg)));
  }

  tx_gate::send_gate_cmd(Box::new(GateCmdGateDown {
    gate_seq: cmd.gate_seq,
    gate: model.clone(),
  }))
  .await;

  crate::util::sleep(2000).await;

  let rslt = gate::sock::do_write_multiple_registers(modbus, write_addr, &get_yesung_clear_cmd()).await;
  if let Err(e) = rslt {
    let msg = format!("[yesung] modbus write error {e:?}");
    log::error!("{msg}");
    let rslt = GateCmdRsltType::Fail;
    let stat = GateStatus::Na;
    send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
    return Err(anyhow::anyhow!(fln!(msg)));
  }

  log::debug!("[yesung] modbus write success...");
  
  let mut interval = time::interval(time::Duration::from_secs(2));
  log::debug!("[yesung] start loop");
  let now = Instant::now();

  let rlt = loop {
    interval.tick().await;
    log::debug!("[yesung] start loop body");
    
    let (rslt, stat, msg) = super::get_status(ctx, read_addr, modbus, cmd, false).await;
    
    if rslt == GateCmdRsltType::Fail {
      send_cmd_res_changed(&ctx, model, &cmd, rslt, stat, msg.clone()).await;
      let msg = format!(
        "[yesung] Fail rslt {rslt} stat {stat} msg {msg} elapsed {} secs",
        now.elapsed().as_secs()
      );
      log::error!("{msg}");
      break Err(anyhow::anyhow!(fln!(msg)));
    }

    if stat == GateStatus::DownOk {
      log::info!(
        "[yesung] DownOk rslt {rslt} stat {stat} msg {msg} elapsed {} secs",
        now.elapsed().as_secs()
      );
      send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
      break Ok(DoGateCmdRslt::Success);
    }

    if now.elapsed().as_secs() > get_cmd_timeout_secs() {
      let msg = format!("[yesung] timeout elapsed {}", now.elapsed().as_secs());
      log::error!("{msg}");
      let rslt = GateCmdRsltType::Fail;
      let stat = GateStatus::Na;
      send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
      break Err(anyhow::anyhow!(fln!(msg)));
    }
  };

  rlt
}