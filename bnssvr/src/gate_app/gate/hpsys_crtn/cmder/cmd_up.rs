use super::pkt;
use crate::{
  entities::tb_gate,
  fln,
  gate_app::{
    gate::{cmd_lock, hpsys_crtn::util::get_cmd_timeout_secs},
    util::{self, get_sock_addr, send_cmd_res_all},
    GateCmd,
  },
  models::cd::{DoGateCmdRslt, GateCmdRsltType, GateStatus},
  GateCtx,
};
use tokio::time::{self, Instant};
use tokio_modbus::client::{Context, Writer};

pub async fn do_cmd_up(
  ctx: &GateCtx,
  model: &tb_gate::Model,
  modbus: &mut Context,
  cmd: &GateCmd,
) -> anyhow::Result<DoGateCmdRslt> {
  let modbuscmd = pkt::get_hpsys_crtn_up_cmd();

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

  crate::util::sleep(util::PLUS_SLEEP).await;

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
      // 실패의 경우에는 안에서 처리함.
      let msg = format!(
        "[HPCRTN] Fail rslt {rslt} stat {stat} msg {msg} elapsed {} secs",
        now.elapsed().as_secs()
      );
      log::error!("{msg}");
      break Err(anyhow::anyhow!(fln!(msg)));
    }

    if stat == GateStatus::UpOk {
      // 성공.
      log::info!(
        "[HPCRTN] UpOk rslt {rslt} stat {stat} msg {msg} elapsed {} secs",
        now.elapsed().as_secs()
      );
      send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
      break Ok(DoGateCmdRslt::Success);
    }

    log::info!(
      "[HPCRTN] Current Status rslt {rslt} stat {stat} msg {msg} elapsed {} secs",
      now.elapsed().as_secs()
    );

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
