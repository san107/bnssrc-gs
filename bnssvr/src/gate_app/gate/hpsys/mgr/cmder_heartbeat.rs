use crate::entities::tb_gate;
use crate::gate_app::gate::hpsys::pkt::ADDR_HEARTBEAT;
use crate::gate_app::util::lock_write_single_register;
use crate::{eanyhowf, GateCtx};
use tokio_modbus::client::Context;

pub async fn do_hpsys_heartbeat(modbus: &mut Context, model: &tb_gate::Model) -> anyhow::Result<()> {
  let addr = ADDR_HEARTBEAT;
  let gate_seq = model.gate_seq;

  // 현재 시간을 초단위로 변환하여 두번째 워드에 기록
  let now = chrono::Local::now().timestamp() as u16;
  log::debug!("[데몬] seq {} addr {} now sec {} (heartbeat value)", gate_seq, addr, now);
  let data = lock_write_single_register(&model, modbus, addr, now).await;
  if let Err(e) = data {
    let msg = format!("[데몬] write_single_register fail seq : {} {e:?}", gate_seq);
    log::error!("{msg}");
    return Err(eanyhowf!("{msg}"));
  }

  Ok(())
}

pub async fn mgr_do_heartbeat(_ctx: &GateCtx, model: &tb_gate::Model, modbus: &mut Context) {
  //
  let rlt = do_hpsys_heartbeat(modbus, &model).await;
  if let Err(e) = rlt {
    let msg = format!("[데몬] do_hpsys_heartbeat fail seq : {} {e:?}", model.gate_seq);
    log::error!("{msg}");
  }
  log::debug!("[데몬] do_hpsys_heartbeat success seq : {}", model.gate_seq);
}
