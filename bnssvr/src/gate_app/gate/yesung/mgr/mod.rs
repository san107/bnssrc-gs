use crate::entities::tb_gate;
use crate::gate_app::gate;
use crate::gate_app::util::vec_to_hex_u16;
use crate::gate_app::util::ws_send_gate_stat_all;
use crate::models::cd::{GateCmdRsltType, GateStatus};
use crate::water::recv_worker::{send, WaterRecvCmd};
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

  let read_addr = super::util::get_read_addr(&model.gate_no);

  let data = gate::sock::do_read_input_registers(&mut modbus, read_addr, 1).await;
  if let Err(e) = data {
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
  
  let data = data.unwrap();

  debug!("[데몬] read data is {:?} {}", data, vec_to_hex_u16(&data));
  if data.len() > 0 {
    log::debug!(
      "[데몬] addr {} {}",
      read_addr,
      super::pkt::parse(data.get(0).unwrap().clone()).join(",")
    );
  }

  // ===== 수위계 데이터 읽기 =====
  
  // 1. 접점식 수위센서 (M0070: 3cm, 5cm)
  let water_sensor_addr = super::util::get_water_sensor_addr(&model.gate_no);
  let sensor_result = gate::sock::do_read_input_registers(&mut modbus, water_sensor_addr, 1).await;
  
  if let Ok(sensor_data) = sensor_result {
    if let Some(sensor_raw) = sensor_data.get(0) {
      let (water_3cm, water_5cm) = super::pkt::parse_water_sensor(*sensor_raw);
      log::info!("[데몬] Yesung water sensors: 3cm={} 5cm={} (seq: {})", water_3cm, water_5cm, seq);
      
      // 예성 전용 이벤트로 전송
      send(WaterRecvCmd::YesungOnoffEvt(model.gate_seq, water_3cm, water_5cm)).await;
    }
  }
  
  // 2. 아날로그 수위센서 (M0092: 0-30cm)
  let water_analog_addr = super::util::get_water_analog_addr(&model.gate_no);
  let analog_result = gate::sock::do_read_input_registers(&mut modbus, water_analog_addr, 1).await;
  
  if let Ok(analog_data) = analog_result {
    if let Some(level_raw) = analog_data.get(0) {
      let level = *level_raw as f64;
      log::info!("[데몬] Yesung water analog: {} cm (seq: {})", level, seq);
      
      // 예성 전용 이벤트로 전송
      send(WaterRecvCmd::YesungAnalogEvt(model.gate_seq, level)).await;
    }
  }

  // ===== 차단기 상태 처리 =====
  cmder::mgr_do_stat(&ctx, &model, &mut modbus).await;

  modbus.disconnect().await.unwrap();
  log::info!("[데몬] seq is {seq} 완료")
}