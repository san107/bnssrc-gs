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

  let down_addr = super::super::util::get_write_down_addr(&model.gate_no);
  log::debug!("[yesung] DOWN addr={} cmd={:?}", down_addr, modbuscmd);

  // P03에 1 쓰기
  let rslt = gate::sock::do_write_multiple_registers(modbus, down_addr, &modbuscmd).await;
  if let Err(e) = rslt {
    let msg = format!("[yesung] DOWN write error {e:?}");
    log::error!("{msg}");
    let rslt = GateCmdRsltType::Fail;
    let stat = GateStatus::Na;
    send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
    return Err(anyhow::anyhow!(fln!(msg)));
  }

  // 하강 진행중 처리
  tx_gate::send_gate_cmd(Box::new(GateCmdGateDown {
    gate_seq: cmd.gate_seq,
    gate: model.clone(),
  }))
  .await;

  crate::util::sleep(2000).await;

  // P03에 0 쓰기 (클리어)
  let rslt = gate::sock::do_write_multiple_registers(modbus, down_addr, &get_yesung_clear_cmd()).await;
  if let Err(e) = rslt {
    let msg = format!("[yesung] DOWN clear error {e:?}");
    log::error!("{msg}");
    let rslt = GateCmdRsltType::Fail;
    let stat = GateStatus::Na;
    send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
    return Err(anyhow::anyhow!(fln!(msg)));
  }

  log::debug!("[yesung] modbus write success...");

  // 상태 확인 루프
  let mut interval = time::interval(time::Duration::from_secs(2));
  log::debug!("[yesung] start loop");
  let now = Instant::now();

  let rlt = loop {
    interval.tick().await;
    log::debug!("[yesung] start loop body");

    let (rslt, stat, msg) = super::get_status(ctx, 0, modbus, cmd, false).await;

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
