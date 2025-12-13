use crate::{
  entities::tb_gate,
  fln, flnf,
  gate_app::{doori::util::get_cmd_timeout_secs, tx_gate, util::send_cmd_res_all, GateCmd, GateCmdGateDown},
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
  let (rslt, stat, msg, _automan, _remloc, _wind) = super::get_status(ctx, modbus, cmd).await;
  if rslt == GateCmdRsltType::Fail {
    // 실패의 경우에는 안에서 처리함.
    return Err(anyhow::anyhow!(flnf!(
      "get_status fail {msg} {} {} {}",
      cmd.cmd_type,
      cmd.gate_seq,
      model.gate_nm
    )));
  } else if rslt == GateCmdRsltType::ModeErr {
    let msg = format!("[DOORI] ModeErr {msg} {} {} {}", cmd.cmd_type, cmd.gate_seq, model.gate_nm);
    log::error!("{msg}");
    send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
    return Err(anyhow::anyhow!(fln!(msg)));
  }

  let addr = super::pkt::CMD_ADDR_DOWN;
  log::debug!("[DOORI] addr is {addr} {} {} {}", cmd.cmd_type, cmd.gate_seq, model.gate_nm);

  let rslt = modbus.write_single_coil(addr, true).await;
  if let Err(e) = rslt {
    //실패.
    let msg = format!(
      "[DOORI] modbus write errro {e:?} {} {} {}",
      cmd.cmd_type, cmd.gate_seq, model.gate_nm
    );
    log::error!("{msg}");
    let rslt = GateCmdRsltType::Fail;
    let stat = GateStatus::Na;
    send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
    return Err(anyhow::anyhow!(fln!(msg)));
  }
  crate::util::sleep(2000).await;

  let rslt = modbus.write_single_coil(addr, false).await;
  if let Err(e) = rslt {
    //실패.
    let msg = format!(
      "[DOORI] modbus write errro {e:?} {} {} {}",
      cmd.cmd_type, cmd.gate_seq, model.gate_nm
    );
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

  log::debug!(
    "[DOORI] modbus write success... {} {} {}",
    cmd.cmd_type,
    cmd.gate_seq,
    model.gate_nm
  );
  // 반복하여 상태를 체크하여, 결과를 얻을 것.
  let mut interval = time::interval(time::Duration::from_secs(2));
  log::debug!("[DOORI] start loop {} {} {}", cmd.cmd_type, cmd.gate_seq, model.gate_nm);
  let now = Instant::now();
  let rlt = loop {
    interval.tick().await;
    log::debug!("[DOORI] start loop body {} {} {}", cmd.cmd_type, cmd.gate_seq, model.gate_nm);
    let (rslt, stat, msg, _automan, _remloc, _wind) = super::get_status(ctx, modbus, cmd).await;
    if let GateCmdRsltType::Fail = rslt {
      let msg = format!(
        "[DOORI] Fail rslt {rslt} stat {stat} msg {msg} elapsed {} secs",
        now.elapsed().as_secs()
      );
      log::error!("{msg}");
      break Err(anyhow::anyhow!(fln!(msg)));
    }

    if let GateStatus::DownOk = stat {
      // 성공.
      log::info!(
        "[DOORI] DownOk rslt {rslt} stat {stat} msg {msg} elapsed {} secs",
        now.elapsed().as_secs()
      );
      send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
      break Ok(DoGateCmdRslt::Success);
    }

    if now.elapsed().as_secs() > get_cmd_timeout_secs() {
      let msg = format!(
        "[DOORI] timeout elapsed {} {} {} {}",
        now.elapsed().as_secs(),
        cmd.cmd_type,
        cmd.gate_seq,
        model.gate_nm
      );
      log::error!("{msg}");
      let rslt = GateCmdRsltType::Fail;
      let stat = GateStatus::Na;
      send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
      break Err(anyhow::anyhow!(fln!(msg)));
    }
  };
  rlt
}
