// bnssvr/src/gate_app/gate/yesung/mgr/mod.rs
use crate::entities::tb_gate;
use crate::gate_app::gate;
use crate::gate_app::util::ws_send_gate_stat_all;
use crate::models::cd::{GateCmdRsltType, GateStatus};
use crate::water::recv_worker::{send, WaterRecvCmd}; // 이 줄 추가!
use crate::GateCtx;
use log::debug;
use tokio_modbus::prelude::*;

mod cmder;

pub async fn mgr_get_status(ctx: GateCtx, model: tb_gate::Model) {
  let seq = model.gate_seq;

  let straddr = format!("{}:{}", model.gate_ip, model.gate_port);

  let modbus = gate::sock::do_connect(&straddr).await;
  if let Err(e) = modbus {
    let msg = format!("[데몬] 연결 에러 {e:?} seq is {seq} {straddr}");
    let stat = GateStatus::Na;
    let rslt = GateCmdRsltType::Fail;

    if model.gate_stat == Some(stat.to_string()) && model.cmd_rslt == Some(rslt.to_string()) {
      debug!("[데몬] 이미 상태가 동일함. {stat:?} {rslt:?}");
      return;
    }
    ws_send_gate_stat_all(&ctx, model.gate_seq, stat, rslt, msg.clone()).await;
    return;
  }

  let mut modbus = modbus.unwrap();

  // 3개 주소 읽기 (차단기 상태)
  let remote_addr = super::util::get_read_remote_addr(&model.gate_no);
  let up_ok_addr = super::util::get_read_up_ok_addr(&model.gate_no);
  let down_ok_addr = super::util::get_read_down_ok_addr(&model.gate_no);

  let remote = gate::sock::do_read_input_registers(&mut modbus, remote_addr, 1).await;

  if let Err(e) = remote {
    let msg = format!("[데몬] read_input_registers fail {e:?}");
    log::error!("{msg}");
    let rslt = GateCmdRsltType::Fail;
    let stat = GateStatus::Na;

    if model.gate_stat == Some(stat.to_string()) && model.cmd_rslt == Some(rslt.to_string()) {
      debug!("[데몬] 이미 상태가 동일함. {stat:?} {rslt:?}");
      return;
    }
    ws_send_gate_stat_all(&ctx, model.gate_seq, stat, rslt, msg.clone()).await;
    return;
  }

  let up_ok = gate::sock::do_read_input_registers(&mut modbus, up_ok_addr, 1).await;
  let down_ok = gate::sock::do_read_input_registers(&mut modbus, down_ok_addr, 1).await;

  let remote_val = remote.unwrap().get(0).unwrap().clone();
  let up_ok_val = up_ok.unwrap_or(vec![0]).get(0).unwrap().clone();
  let down_ok_val = down_ok.unwrap_or(vec![0]).get(0).unwrap().clone();

  debug!(
    "[데몬] P00={} P08={} P09={} {}",
    remote_val,
    up_ok_val,
    down_ok_val,
    super::pkt::parse(remote_val, up_ok_val, down_ok_val).join(",")
  );

  // 수위계 데이터 읽기 (M0092: 아날로그 수위 0-30cm)
  let water_level_addr = super::util::get_water_analog_addr(&model.gate_no);
  let water_level_result = gate::sock::do_read_input_registers(&mut modbus, water_level_addr, 1).await;

  if let Ok(water_data) = water_level_result {
    if let Some(level_raw) = water_data.get(0) {
      // level_raw는 0-30 범위의 값 (cm 단위)
      let level = *level_raw as f64;
      log::info!("[데몬] Yesung water level: {} cm (seq: {})", level, seq);

      // 수위계 워커로 전송
      send(WaterRecvCmd::YesungEvt(model.gate_seq, level)).await;
    }
  } else {
    log::debug!("[데몬] 수위계 데이터 읽기 실패 (정상 - 수위계 미설치 가능)");
  }

  // 차단기 상태 처리
  cmder::mgr_do_stat(&ctx, &model, &mut modbus).await;

  modbus.disconnect().await.unwrap();
  log::info!("[데몬] seq is {seq} 완료")
}
