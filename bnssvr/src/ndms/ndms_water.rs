use sea_orm::DbConn;

use crate::svc::ndms::{svc_flud_wal, svc_ndms_map_water};

use super::ndms_model::NdmsWater;

pub async fn do_ndms_water(db: DbConn, cmd: NdmsWater) {
  log::info!("do_ndms_water {:?}", cmd);

  let dev_id = &cmd.water_dev_id;
  let list = svc_ndms_map_water::qry::Qry::find_by_water_dev_id(&db, dev_id).await;
  if let Err(e) = list {
    log::error!("nmds water db error : {:?}", e);
    return;
  }

  let list = list.unwrap();
  if list.is_empty() {
    log::warn!("nmds water list is empty {cmd:?}");
    return;
  }

  for mut item in list {
    log::info!("item : {:?}", item);
    // update 데이터. 수신일시, 수위값.
    item.last_colct_wal = Some(cmd.water_level);
    item.last_colct_de = Some(cmd.water_dt.format("%Y%m%d%H%M%S").to_string());
    let rlt = svc_flud_wal::mtn::Mtn::save_model(&db, item).await;
    if let Err(e) = rlt {
      log::error!("nmds water db save error : {:?}", e);
      return;
    }
  }
}
