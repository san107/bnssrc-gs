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

  let read_addr = super::super::util::get_read_addr(&model.gate_no);
  let write_addr = super::super::util::get_write_addr(&model.gate_no);

  // === 1단계: 하강 명령 전송 ===
  let rslt = gate::sock::do_write_multiple_registers(modbus, write_addr, &modbuscmd).await;
  if let Err(e) = rslt {
    let msg = format!(
      "[yesung-autodown] modbus write error {e:?} {} {} {}",
      cmd.cmd_type, cmd.gate_seq, model.gate_nm
    );
    log::error!("{msg}");
    
    // tx_api가 있을 때만 응답 전송
    if cmd.tx_api.is_some() {
      send_cmd_res_all(&ctx, &cmd, GateCmdRsltType::Fail, GateStatus::Na, msg.clone()).await;
    }
    return Err(anyhow::anyhow!(fln!(msg)));
  }

  // Gate Down 이벤트 전송 (전광판, 비상통화 등)
  tx_gate::send_gate_cmd(Box::new(GateCmdGateAutoDown {
    gate_seq: model.gate_seq,
    gate: model.clone(),
  }))
  .await;

  // === 2단계: 명령 클리어 전 대기 (중요!) ===
  crate::util::sleep(3000).await; // 2초 → 3초로 증가

  // === 3단계: 명령 클리어 ===
  let rslt = gate::sock::do_write_multiple_registers(modbus, write_addr, &get_yesung_clear_cmd()).await;
  if let Err(e) = rslt {
    let msg = format!(
      "[yesung-autodown] modbus clear error {e:?} {} {} {}",
      cmd.cmd_type, cmd.gate_seq, model.gate_nm
    );
    log::error!("{msg}");
    
    if cmd.tx_api.is_some() {
      send_cmd_res_all(&ctx, &cmd, GateCmdRsltType::Fail, GateStatus::Na, msg.clone()).await;
    }
    return Err(anyhow::anyhow!(fln!(msg)));
  }

  log::info!(
    "[yesung-autodown] command sent successfully {} {} {}",
    cmd.cmd_type, cmd.gate_seq, model.gate_nm
  );
  
  // === 4단계: 상태 확인 루프 (Modbus 안정화 후) ===
  crate::util::sleep(2000).await; // 추가 대기
  
  let mut interval = time::interval(time::Duration::from_secs(3)); // 2초 → 3초
  let now = Instant::now();
  
  let rlt = loop {
    interval.tick().await;
    log::debug!("[yesung-autodown] checking status {} {} {}", cmd.cmd_type, cmd.gate_seq, model.gate_nm);
    
    // skipres=true로 설정하여 get_status 내부에서 응답 전송 안 함
    let (rslt, stat, msg) = super::get_status(ctx, read_addr, modbus, cmd, true).await;
    
    if rslt == GateCmdRsltType::Fail {
      let msg = format!(
        "[yesung-autodown] Status check failed {rslt} {stat} {msg}{cmdmsg} elapsed {} secs",
        now.elapsed().as_secs()
      );
      log::error!("{msg}");
      
      // 실패 시에도 tx_api 확인
      if cmd.tx_api.is_some() {
        send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
      }
      break Err(anyhow::anyhow!(fln!(msg)));
    }

    if stat == GateStatus::DownOk {
      log::info!(
        "[yesung-autodown] DownOk confirmed! {rslt} {stat} {msg}{cmdmsg} elapsed {} secs",
        now.elapsed().as_secs()
      );
      let msg = format!("[yesung-autodown] {msg}{cmdmsg} elapsed {} secs", now.elapsed().as_secs());
      
      // 성공 시에만 응답 전송
      if cmd.tx_api.is_some() {
        send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
      }
      break Ok(DoGateCmdRslt::Success);
    }

    // 타임아웃 체크
    if now.elapsed().as_secs() > get_cmd_timeout_secs() {
      let msg = format!(
        "[yesung-autodown] timeout {} secs elapsed {} {} {}",
        now.elapsed().as_secs(),
        cmd.cmd_type,
        cmd.gate_seq,
        model.gate_nm
      );
      log::error!("{msg}");
      
      if cmd.tx_api.is_some() {
        send_cmd_res_all(&ctx, &cmd, GateCmdRsltType::Fail, GateStatus::Na, msg.clone()).await;
      }
      break Err(anyhow::anyhow!(fln!(msg)));
    }
  };

  rlt
}