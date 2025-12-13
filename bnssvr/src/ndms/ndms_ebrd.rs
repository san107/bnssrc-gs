use sea_orm::DbConn;

use crate::{
  ndms::ndms_model::NdmsEbrd,
  svc::ndms::{svc_flud_board, svc_ndms_map_ebrd},
};

pub async fn do_ndms_ebrd(db: DbConn, cmd: NdmsEbrd) {
  log::info!("do_ndms_ebrd {:?}", cmd);
  let list = svc_ndms_map_ebrd::qry::Qry::find_by_ebrd_seq(&db, cmd.ebrd_seq).await;
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
    item.comm_sttus = cmd.comm_stat.clone();
    item.msg_board = cmd.msg_board.clone();
    let rlt = svc_flud_board::mtn::Mtn::save_ndms_model(&db, item, &cmd).await;
    if let Err(e) = rlt {
      log::error!("nmds water db save error : {:?}", e);
      return;
    }
  }
}
