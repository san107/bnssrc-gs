// bnssvr/src/water/recv_worker/yesung/mod.rs
use sea_orm::*;

use crate::{entities::tb_water, svc::water::svc_water, water::recv_worker::water_util};

async fn do_yesung_water(db: &DbConn, model: &tb_water::Model, level: f64) -> anyhow::Result<()> {
  log::info!(
    "do_yesung_water water_seq {} dev_id {} level {}",
    model.water_seq,
    model.water_dev_id,
    level
  );

  water_util::do_water_level(&db, &model.water_dev_id, level).await?;

  Ok(())
}

async fn _handle_yesung(db: &DbConn, gate_seq: i32, level: f64) -> anyhow::Result<()> {
  log::info!("handle yesung water gate_seq {} level {}", gate_seq, level);

  /*
   * 1. gate_seq 는 gate 일련번호이므로, 예성 수위계로 설정되어 있는 모든 수위계를 찾는다.
   *   - 수위계타입이 YesungWg 인지 확인한다.
   *   - 모든 수위계에 대해서, 수위계 수신 처리를 수행한다.
   * 2. 수위계 그룹 처리.
   */

  let waters = svc_water::qry::Qry::find_by_water_gate_seq(&db, "YesungWg", gate_seq).await?;
  if waters.is_empty() {
    log::debug!("no yesung water found for gate_seq {}", gate_seq);
    return Ok(());
  }

  for water in waters {
    let rslt = do_yesung_water(&db, &water, level).await;
    if let Err(e) = rslt {
      log::error!("do_yesung_water error {:?} {water:?}", e);
    }
  }

  Ok(())
}

pub async fn handle_yesung(db: DbConn, gate_seq: i32, level: f64) -> anyhow::Result<()> {
  let rslt = _handle_yesung(&db, gate_seq, level).await;
  if let Err(e) = rslt {
    log::error!("handle_yesung error {:?} gate_seq={} level={}", e, gate_seq, level);
    return Err(e);
  }
  Ok(())
}
