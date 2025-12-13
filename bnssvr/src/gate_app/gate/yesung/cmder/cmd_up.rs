use super::pkt;
use crate::{
  entities::tb_gate,
  fln,
  gate_app::{
    gate::{
      self,
      yesung::{pkt::get_yesung_clear_cmd, util::get_cmd_timeout_secs},
    },
    util::send_cmd_res_all,
    GateCmd,
  },
  models::cd::{DoGateCmdRslt, GateCmdRsltType, GateStatus},
  GateCtx,
};
use tokio::time::{self, Instant};
use tokio_modbus::client::Context;

pub async fn do_cmd_up(
  ctx: &GateCtx,
  model: &tb_gate::Model,
  modbus: &mut Context,
  cmd: &GateCmd,
) -> anyhow::Result<DoGateCmdRslt> {
  let modbuscmd = pkt::get_yesung_up_cmd();
  let modbuscmd = vec![modbuscmd];

  let addr = super::super::util::get_gate_addr(&model.gate_no);
  log::debug!("[yesung] addr is {addr}");

  let rslt = gate::sock::do_write_multiple_registers(modbus, addr, &modbuscmd).await;
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

  let rslt = gate::sock::do_write_multiple_registers(modbus, addr, &get_yesung_clear_cmd()).await;
  if let Err(e) = rslt {
    //실패.
    let msg = format!("[yesung] modbus write errro {e:?}");
    log::error!("{msg}");
    let rslt = GateCmdRsltType::Fail;
    let stat = GateStatus::Na;
    send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
    return Err(anyhow::anyhow!(fln!(msg)));
  }

  log::debug!("[yesung] modbus write success... ");
  // 반복하여 상태를 체크하여, 결과를 얻을 것.
  let mut interval = time::interval(time::Duration::from_secs(2));
  log::debug!("[yesung] start loop");
  let now = Instant::now();
  let rlt = loop {
    interval.tick().await;
    log::debug!("[yesung] start loop body");
    let (rslt, stat, msg) = super::get_status(ctx, addr, modbus, cmd, false).await;
    if rslt == GateCmdRsltType::Fail {
      // 실패의 경우에는 안에서 처리함.
      let msg = format!(
        "[yesung] Fail rslt {rslt} stat {stat} msg {msg} elapsed {} secs",
        now.elapsed().as_secs()
      );
      log::error!("{msg}");
      break Err(anyhow::anyhow!(fln!(msg)));
    }

    if stat == GateStatus::UpOk {
      // 성공.
      log::info!(
        "[yesung] UpOk rslt {rslt} stat {stat} msg {msg} elapsed {} secs",
        now.elapsed().as_secs()
      );
      send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
      break Ok(DoGateCmdRslt::Success);
    }

    log::info!(
      "[yesung] Current Status rslt {rslt} stat {stat} msg {msg} elapsed {} secs",
      now.elapsed().as_secs()
    );

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
