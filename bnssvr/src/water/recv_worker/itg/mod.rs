use crate::{emcall_app::model::ItgEvent, water::recv_worker::water_util};
use sea_orm::*;

async fn _handle_itg_event(db: &DbConn, itg_event: ItgEvent) -> anyhow::Result<()> {
  log::info!("handle itg event {:?}", itg_event);
  /*
   * 1. 수위계 상태 처리.
   * 1.1
   * 2. 수위계 그룹 처리.
   */
  if itg_event.event_type == "B_ALIVE" {
    if itg_event.s1_status.as_deref() == Some("S1_ON_STATUS") {
      // 수위계 상태 처리.
      water_util::do_water_onoff1(&db, &itg_event.device_id, true).await?;
    } else if itg_event.s1_status.as_deref() == Some("S1_OFF_STATUS") {
      // 수위계 상태 처리.
      water_util::do_water_onoff1(&db, &itg_event.device_id, false).await?;
    } else {
      log::info!("skip event type {:?}", itg_event);
    }
  } else if itg_event.event_type == "S1_ON" {
    // 수위계 상태 처리.
    water_util::do_water_onoff1(&db, &itg_event.device_id, true).await?;
  } else if itg_event.event_type == "S1_OFF" {
    // 수위계 상태 처리.
    water_util::do_water_onoff1(&db, &itg_event.device_id, false).await?;
  } else {
    // 수위계 상태 처리.
    log::debug!("skip event type {:?}", itg_event);
  }

  Ok(())
}

pub async fn handle_itg_event(db: DbConn, itg_event: ItgEvent) -> anyhow::Result<()> {
  let rslt = _handle_itg_event(&db, itg_event.clone()).await;
  if let Err(e) = rslt {
    log::error!("handle_itg_event error {:?} {itg_event:?}", e);
    return Err(e);
  }
  rslt
}
