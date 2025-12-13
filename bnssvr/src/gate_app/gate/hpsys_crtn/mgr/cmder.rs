use crate::entities::tb_gate;
use crate::gate_app::gate::cmd_lock;
use crate::gate_app::gate::hpsys_crtn::pkt::{ADDR_ONOFF_STAT, ADDR_WATER_LEVEL};
use crate::gate_app::util::{get_sock_addr, lock_read_holding_registers, vec_to_hex, ws_send_gate_stat_all};
use crate::models::cd::{GateCmdRsltType, GateStatus};
use crate::water::recv_worker::WaterRecvCmd;
use crate::{eanyhowf, water, GateCtx};
use log::debug;
use tokio_modbus::client::{Context, Reader};

pub async fn do_hpsys_crtn_water(model: &tb_gate::Model, modbus: &mut Context) -> anyhow::Result<()> {
  let addr = ADDR_ONOFF_STAT;
  let data = lock_read_holding_registers(&model, modbus, addr, 1).await??;
  let data = data.get(0).ok_or(eanyhowf!("data is none"))?.clone();
  let is_on1 = super::super::pkt::get_hpsys_crtn_onoff1_is_on(data);
  let is_on2 = super::super::pkt::get_hpsys_crtn_onoff2_is_on(data);
  let gate_seq = model.gate_seq;

  water::recv_worker::send(WaterRecvCmd::HpOnoffEvt(gate_seq, is_on1, is_on2)).await;

  let addr = ADDR_WATER_LEVEL;

  // 00 00 41 50 으로 읽히는 경우,
  // 41 50 00 00 으로 bytes를 변환후, 읽어야 값이 제대로 읽힌다.
  // 리틀엔디언 데이터로 보임.
  let lock = cmd_lock::mutex(&get_sock_addr(&model)).await;
  let data: Vec<u8> = modbus
    .read_holding_registers(addr, 2)
    .await??
    .into_iter()
    .rev()
    .flat_map(|v| v.to_be_bytes())
    .collect();
  drop(lock);
  log::debug!("[데몬] seq {} addr {} data {}", gate_seq, addr, vec_to_hex(&data));

  let data: [u8; 4] = data
    .try_into()
    .map_err(|e| eanyhowf!("data falut seq:{gate_seq} data:{e:?} "))?;
  //log::debug!("[데몬] u8;4 seq {} addr {} data {:?}", gate_seq, addr, data);
  let level = f32::from_be_bytes(data) as f64;

  //log::debug!("[데몬] seq {} addr {} level {:?}", gate_seq, addr, level);
  // 수위 변환은 여기 한군데서 처리함.
  let level = level * 0.01;

  log::debug!("[데몬] seq {} addr {} level {}", gate_seq, addr, level);

  water::recv_worker::send(WaterRecvCmd::HpAnalogEvt(gate_seq, level)).await;

  Ok(())
}

pub async fn mgr_get_status(
  ctx: &GateCtx,
  addr: u16,
  modbus: &mut Context,
  model: &tb_gate::Model,
) -> (GateCmdRsltType, GateStatus, String) {
  // HP수위계의 경우, 수위계 값 처리.

  let rlt = do_hpsys_crtn_water(model, modbus).await;
  if let Err(e) = rlt {
    let msg = format!("[데몬] do_hpsys_crtn_water fail seq : {} {e:?}", model.gate_seq);
    log::error!("{msg}");
  }

  let data = lock_read_holding_registers(&model, modbus, addr, 1).await;
  if let Err(e) = data {
    let msg = format!("[데몬] read_holding_registers fail seq : {} {e:?}", model.gate_seq);
    log::error!("{msg}");
    let rslt = GateCmdRsltType::Fail;
    let stat = GateStatus::Na;
    if model.gate_stat == Some(stat.to_string()) && model.cmd_rslt == Some(rslt.to_string()) {
      debug!("[데몬] 이미 상태가 동일함. seq {} {stat:?} {rslt:?}", model.gate_seq);
      return (rslt, stat, msg);
    }
    ws_send_gate_stat_all(&ctx, model.gate_seq, stat, rslt, msg.clone()).await;
    return (rslt, stat, msg);
  }
  let data = data.unwrap();
  if let Err(e) = data {
    let msg = format!("[데몬] read_holding_registers fail seq : {} {e:?}", model.gate_seq);
    log::error!("{msg}");
    let rslt = GateCmdRsltType::Fail;
    let stat = GateStatus::Na;
    if model.gate_stat == Some(stat.to_string()) && model.cmd_rslt == Some(rslt.to_string()) {
      debug!("[데몬] 이미 상태가 동일함. seq {} {stat:?} {rslt:?}", model.gate_seq);
      return (rslt, stat, msg);
    }
    ws_send_gate_stat_all(&ctx, model.gate_seq, stat, rslt, msg.clone()).await;
    return (rslt, stat, msg);
  }
  let data = data.unwrap();
  let data = data.get(0).unwrap().clone();
  let stat = super::super::pkt::get_hpsys_crtn_stat(data);
  log::debug!(
    "[데몬] seq {} addr {} flags {}",
    model.gate_seq,
    addr,
    super::super::pkt::parse(data).join(",")
  );

  let rslt = if super::super::pkt::get_hpsys_crtn_is_remote(data) {
    GateCmdRsltType::Success
  } else {
    GateCmdRsltType::ModeErr
  };

  (rslt, stat, "[데몬]".to_owned())
}

pub async fn mgr_do_stat(ctx: &GateCtx, model: &tb_gate::Model, modbus: &mut Context) {
  super::cmder_heartbeat::mgr_do_heartbeat(&ctx, &model, modbus).await;

  let addr = super::super::util::get_gate_addr(&model.gate_no);
  let (rslt, stat, msg) = mgr_get_status(ctx, addr, modbus, model).await;
  if rslt == GateCmdRsltType::Fail {
    return;
  }
  if model.gate_stat == Some(stat.to_string()) && model.cmd_rslt == Some(rslt.to_string()) {
    debug!("[데몬] 이미 상태가 동일함. seq {} {stat:?} {rslt:?}", model.gate_seq);
    return;
  }
  ws_send_gate_stat_all(&ctx, model.gate_seq, stat, rslt, msg.clone()).await;
}
