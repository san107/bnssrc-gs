use sea_orm::*;

use crate::{entities::tb_water, svc::water::svc_water, water::recv_worker::water_util};

#[allow(dead_code)]
async fn do_hpsys_crtn(db: &DbConn, model: &tb_water::Model, level: f64) -> anyhow::Result<()> {
  log::info!(
    "do_hpsys_crtn_onoff water_seq {} dev_id {} onoff {}",
    model.water_seq,
    model.water_dev_id,
    level
  );

  water_util::do_water_level(&db, &model.water_dev_id, level).await?;

  Ok(())
}

async fn _handle_hpcrtn(db: &DbConn, gate_seq: i32, level: f64) -> anyhow::Result<()> {
  log::info!("handle hpcrtn onoff gate_seq {} onoff {}", gate_seq, level);
  /*
   * 1. onoff 가 true 이면, 침수상태임.
   * 2. gate_seq 는 gate 일련번호이므로, 수위계차단기로 설정되어 있는 모든 수위계를 찾는다.
   *   - 수위계타입이, HpOnoff 인지 확인한다.
   *   - 모든 수위계에 대해서, 수위계 수신 처리를 수행한다.
   *   - 동일 메시지가 여러번 올 수 있으므로, 10초 이내의 메시지는 처리하지 않는다.
   * 3. onoff 가 false 이면, 침수상태가 아님.
   *   - 수위계 그룹 처리.
   */

  let watrs = svc_water::qry::Qry::find_by_water_gate_seq(&db, "HpAnalog", gate_seq).await?;
  if watrs.is_empty() {
    log::info!("no water found for gate_seq {}", gate_seq);
    return Ok(());
  }

  for water in watrs {
    let rslt = do_hpsys_crtn(&db, &water, level).await;
    if let Err(e) = rslt {
      log::error!("do_hpsys_crtn_onoff error {:?} {water:?}", e);
    }
  }

  Ok(())
}

pub async fn handle_hpcrtn(db: DbConn, gate_seq: i32, level: f64) -> anyhow::Result<()> {
  let rslt = _handle_hpcrtn(&db, gate_seq, level).await;
  if let Err(e) = rslt {
    log::error!("handle_hpcrtn_onoff error {:?} {gate_seq:?} {level:?}", e);
    return Err(e);
  }
  Ok(())
}
