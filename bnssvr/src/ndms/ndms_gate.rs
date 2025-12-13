use sea_orm::DbConn;

use crate::svc::ndms::{svc_flud_car_intrcp, svc_ndms_map_gate};

use super::ndms_model::NdmsGate;

pub async fn do_ndms_gate(db: DbConn, cmd: NdmsGate) {
  log::info!("do_ndms_gate {:?}", cmd);
  let list = svc_ndms_map_gate::qry::Qry::find_by_gate_seq(&db, cmd.gate_seq).await;
  if let Err(e) = list {
    log::error!("nmds gate db error : {:?}", e);
    return;
  }

  let list = list.unwrap();
  if list.is_empty() {
    log::warn!("nmds gate list is empty {cmd:?}");
    return;
  }

  //svc_flud_car_intrcp::mtn::Mtn::save_ndms_model(&db, cmd).await;
  for mut item in list {
    log::info!("item : {:?}", item);
    // update 데이터. 수신일시, 수위값.
    item.comm_sttus = cmd.comm_sttus.clone();
    item.intrcp_sttus = cmd.intrcp_sttus.clone();
    let rlt = svc_flud_car_intrcp::mtn::Mtn::save_ndms_model(&db, item, &cmd).await;
    if let Err(e) = rlt {
      log::error!("nmds water db save error : {:?}", e);
      return;
    }
  }
}
