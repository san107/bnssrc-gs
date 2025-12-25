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
    util::send_cmd_res_all,
    GateCmd, GateCmdGateAutoDown,
  },
  models::cd::{DoGateCmdRslt, GateCmdRsltType, GateStatus},
  GateCtx,
};
use tokio::time::{self, Instant};
use tokio_modbus::client::Context;

pub async fn do_cmd_autodown(
  ctx: &GateCtx,
  model: &tb_gate::Model,
  modbus: &mut Context,
  cmd: &GateCmd,
) -> anyhow::Result<DoGateCmdRslt> {
  let cmdmsg = cmd.msg.clone().unwrap_or("".to_owned());
  let modbuscmd = pkt::get_yesung_down_cmd();
  let modbuscmd = vec![modbuscmd];

  let down_addr = super::super::util::get_write_down_addr(&model.gate_no);

  // P03에 1 쓰기
  let rslt = gate::sock::do_write_multiple_registers(modbus, down_addr, &modbuscmd).await;
  if let Err(e) = rslt {
    let msg = format!(
      "[yesung] modbus write error {e:?} {} {} {}",
      cmd.cmd_type, cmd.gate_seq, model.gate_nm
    );
    log::error!("{msg}");
    let rslt = GateCmdRsltType::Fail;
    let stat = GateStatus::Na;
    send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
    return Err(anyhow::anyhow!(fln!(msg)));
  }

  // gate down 후속처리
  tx_gate::send_gate_cmd(Box::new(GateCmdGateAutoDown {
    gate_seq: model.gate_seq,
    gate: model.clone(),
  }))
  .await;

  crate::util::sleep(2000).await;

  // P03에 0 쓰기
  let rslt = gate::sock::do_write_multiple_registers(modbus, down_addr, &get_yesung_clear_cmd()).await;
  if let Err(e) = rslt {
    let msg = format!(
      "[yesung] modbus write error {e:?} {} {} {}",
      cmd.cmd_type, cmd.gate_seq, model.gate_nm
    );
    log::error!("{msg}");
    let rslt = GateCmdRsltType::Fail;
    let stat = GateStatus::Na;
    send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
    return Err(anyhow::anyhow!(fln!(msg)));
  }

  log::debug!(
    "[yesung] modbus write success...{} {} {}",
    cmd.cmd_type,
    cmd.gate_seq,
    model.gate_nm
  );

  // 반복하여 상태 체크
  let mut interval = time::interval(time::Duration::from_secs(2));
  log::debug!("[yesung] start loop {} {} {}", cmd.cmd_type, cmd.gate_seq, model.gate_nm);
  let now = Instant::now();

  let rlt = loop {
    interval.tick().await;
    log::debug!("[yesung] start loop body {} {} {}", cmd.cmd_type, cmd.gate_seq, model.gate_nm);

    let (rslt, stat, msg) = super::get_status(ctx, 0, modbus, cmd, false).await;

    if rslt == GateCmdRsltType::Fail {
      let msg = format!(
        "[yesung] Fail {rslt} stat {stat} msg {msg}{cmdmsg} elapsed {} secs",
        now.elapsed().as_secs()
      );
      log::error!("{msg}");
      break Err(anyhow::anyhow!(fln!(msg)));
    }

    if stat == GateStatus::DownOk {
      log::info!(
        "[yesung] DownOk rslt {rslt} stat {stat} msg {msg}{cmdmsg} elapsed {} secs",
        now.elapsed().as_secs()
      );
      let msg = format!("[yesung] {msg}{cmdmsg} elapsed {} secs", now.elapsed().as_secs());
      send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
      break Ok(DoGateCmdRslt::Success);
    }

    if now.elapsed().as_secs() > get_cmd_timeout_secs() {
      let msg = format!(
        "[yesung] timeout elapsed {} {} {} {}",
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
