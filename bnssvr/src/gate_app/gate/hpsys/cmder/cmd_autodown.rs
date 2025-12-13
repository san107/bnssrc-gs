use super::pkt;
use crate::{
  entities::tb_gate,
  fln,
  gate_app::{
    gate::cmd_lock,
    hpsys::{pkt::get_hpsys_clear_cmd, util::get_cmd_timeout_secs},
    tx_gate,
    util::{get_sock_addr, send_cmd_res_all, PLUS_SLEEP},
    GateCmd, GateCmdGateAutoDown,
  },
  models::cd::{DoGateCmdRslt, GateCmdRsltType, GateStatus},
  GateCtx,
};
use tokio::time::{self, Instant};
use tokio_modbus::client::{Context, Writer};

pub async fn do_cmd_autodown(
  ctx: &GateCtx,
  model: &tb_gate::Model,
  modbus: &mut Context,
  cmd: &GateCmd,
) -> anyhow::Result<DoGateCmdRslt> {
  let cmdmsg = cmd.msg.clone().unwrap_or("".to_owned());
  let modbuscmd = pkt::get_hpsys_down_cmd();
  let modbuscmd = vec![modbuscmd];

  let addr = super::super::util::get_gate_addr(&model.gate_no);

  let lock = cmd_lock::mutex(&get_sock_addr(&model)).await;
  let lock = lock.lock().await;

  let rslt = modbus.write_multiple_registers(addr + 1, &modbuscmd).await;
  if let Err(e) = rslt {
    //실패.
    let msg = format!("[HPAUTO] modbus write errro {e:?}{cmdmsg}");
    log::error!("{msg}");
    let rslt = GateCmdRsltType::Fail;
    let stat = GateStatus::Na;
    send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
    return Err(anyhow::anyhow!(fln!(msg)));
  }

  // gate down 후속처리.
  tx_gate::send_gate_cmd(Box::new(GateCmdGateAutoDown {
    gate_seq: model.gate_seq,
    gate: model.clone(),
  }))
  .await;

  crate::util::sleep(PLUS_SLEEP).await;

  let rslt = modbus.write_multiple_registers(addr + 1, &get_hpsys_clear_cmd()).await;
  drop(lock); // lock 해제.
  if let Err(e) = rslt {
    //실패.
    let msg = format!("[HPAUTO] modbus write errro {e:?}{cmdmsg}");
    log::error!("{msg}");
    let rslt = GateCmdRsltType::Fail;
    let stat = GateStatus::Na;
    send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
    return Err(anyhow::anyhow!(fln!(msg)));
  }

  log::debug!("[HPAUTO] modbus write success...{cmdmsg}");
  // 반복하여 상태를 체크하여, 결과를 얻을 것.
  let mut interval = time::interval(time::Duration::from_secs(2));
  log::debug!("[HPAUTO] start loop{cmdmsg}");
  let now = Instant::now();
  let rlt = loop {
    interval.tick().await;
    log::debug!("[HPAUTO] start loop body{cmdmsg}");
    let (rslt, stat, msg) = super::get_status(ctx, addr, modbus, cmd, model).await;
    if rslt == GateCmdRsltType::Fail {
      let msg = format!(
        "[HPAUTO] Fail {rslt} stat {stat} msg {msg}{cmdmsg} elapsed {} secs",
        now.elapsed().as_secs()
      );
      log::error!("{msg}");
      break Err(anyhow::anyhow!(fln!(msg)));
    }

    if stat == GateStatus::DownOk {
      // 성공.
      log::info!(
        "[HPAUTO] DownOk rslt {rslt} stat {stat} msg {msg}{cmdmsg} elapsed {} secs",
        now.elapsed().as_secs()
      );
      let msg = format!("[HPAUTO] {msg}{cmdmsg} elapsed {} secs", now.elapsed().as_secs());
      send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
      break Ok(DoGateCmdRslt::Success);
    }

    if now.elapsed().as_secs() > get_cmd_timeout_secs() {
      let msg = format!("[HPAUTO] timeout elapsed {}{cmdmsg}", now.elapsed().as_secs());
      log::error!("{msg}");
      let rslt = GateCmdRsltType::Fail;
      let stat = GateStatus::Na;
      send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
      break Err(anyhow::anyhow!(fln!(msg)));
    }
  };

  rlt
}
