use super::pkt;
use crate::{
  entities::tb_gate,
  fln,
  gate_app::{
    gate::{cmd_lock, hpsys_crtn::util::get_cmd_timeout_secs},
    tx_gate,
    util::{get_sock_addr, send_cmd_res_all, PLUS_SLEEP},
    GateCmd, GateCmdGateDown,
  },
  models::cd::{DoGateCmdRslt, GateCmdRsltType, GateStatus},
  GateCtx,
};
use tokio::time::{self, Instant};
use tokio_modbus::client::{Context, Writer};

/**
 * down command.
 */
pub async fn do_cmd_down(
  ctx: &GateCtx,
  model: &tb_gate::Model,
  modbus: &mut Context,
  cmd: &GateCmd,
) -> anyhow::Result<DoGateCmdRslt> {
  //
  let modbuscmd = pkt::get_hpsys_crtn_down_cmd();

  let addr = super::super::util::get_gate_addr(&model.gate_no);
  log::debug!("[HPCRTN] addr is {addr}");

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

  // 일단 버튼이 눌리면, 하강 진행중인 것으로 처리.
  tx_gate::send_gate_cmd(Box::new(GateCmdGateDown {
    gate_seq: cmd.gate_seq,
    gate: model.clone(),
  }))
  .await;

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
  // 반복하여 상태를 체크하여, 결과를 얻을 것.
  let mut interval = time::interval(time::Duration::from_secs(2));
  log::debug!("[HPCRTN] start loop");
  let now = Instant::now();

  let rlt = loop {
    interval.tick().await;
    log::debug!("[HPCRTN] start loop body");
    let (rslt, stat, msg) = super::get_status(ctx, addr, modbus, cmd, model).await;
    if rslt == GateCmdRsltType::Fail {
      let msg = format!(
        "[HPCRTN] Fail rslt {rslt} stat {stat} msg {msg} elapsed {} secs",
        now.elapsed().as_secs()
      );
      log::error!("{msg}");
      break Err(anyhow::anyhow!(fln!(msg)));
    }

    if stat == GateStatus::DownOk {
      log::info!(
        "[HPCRTN] DownOk rslt {rslt} stat {stat} msg {msg} elapsed {} secs",
        now.elapsed().as_secs()
      );
      send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
      break Ok(DoGateCmdRslt::Success);
    }

    if now.elapsed().as_secs() > get_cmd_timeout_secs() {
      let msg = format!("[HPCRTN] timeout elapsed {}", now.elapsed().as_secs());
      log::error!("{msg}");
      let rslt = GateCmdRsltType::Fail;
      let stat = GateStatus::Na;
      send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
      break Err(anyhow::anyhow!(fln!(msg)));
    }
  };

  rlt
}
