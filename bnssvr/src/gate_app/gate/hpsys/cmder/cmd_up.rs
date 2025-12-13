use super::pkt;
use crate::{
  entities::tb_gate,
  fln,
  gate_app::{
    gate::cmd_lock,
    hpsys::{pkt::get_hpsys_clear_cmd, util::get_cmd_timeout_secs},
    util::{get_sock_addr, send_cmd_res_all, PLUS_SLEEP},
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
  let modbuscmd = pkt::get_hpsys_up_cmd();
  let modbuscmd = vec![modbuscmd];

  let addr = super::super::util::get_gate_addr(&model.gate_no);
  log::debug!("[HPSYS] addr is {addr}");

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
  // 반복하여 상태를 체크하여, 결과를 얻을 것.
  let mut interval = time::interval(time::Duration::from_secs(2));
  log::debug!("[HPSYS] start loop");
  let now = Instant::now();
  let rlt = loop {
    interval.tick().await;
    log::debug!("[HPSYS] start loop body");
    let (rslt, stat, msg) = super::get_status(ctx, addr, modbus, cmd, model).await;
    if rslt == GateCmdRsltType::Fail {
      // 실패의 경우에는 안에서 처리함.
      let msg = format!(
        "[HPSYS] Fail rslt {rslt} stat {stat} msg {msg} elapsed {} secs",
        now.elapsed().as_secs()
      );
      log::error!("{msg}");
      break Err(anyhow::anyhow!(fln!(msg)));
    }

    if stat == GateStatus::UpOk {
      // 성공.
      log::info!(
        "[HPSYS] UpOk rslt {rslt} stat {stat} msg {msg} elapsed {} secs",
        now.elapsed().as_secs()
      );
      send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
      break Ok(DoGateCmdRslt::Success);
    }

    log::info!(
      "[HPSYS] Current Status rslt {rslt} stat {stat} msg {msg} elapsed {} secs",
      now.elapsed().as_secs()
    );

    if now.elapsed().as_secs() > get_cmd_timeout_secs() {
      let msg = format!("[HPSYS] timeout elapsed {}", now.elapsed().as_secs());
      log::error!("{msg}");
      let rslt = GateCmdRsltType::Fail;
      let stat = GateStatus::Na;
      send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
      break Err(anyhow::anyhow!(fln!(msg)));
    }
  };

  rlt
}
