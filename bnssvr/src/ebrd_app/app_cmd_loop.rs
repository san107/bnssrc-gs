use sea_orm::DbConn;
use tokio::sync::{broadcast, mpsc::Receiver};

use crate::ebrd_app::{
  model::{EbrdWebOperNightTime, EbrdWebRoomDel, EbrdWebRoomDelAll, EbrdWebRoomInfo, EbrdWebTime},
  webcmd::{webcmd_oper_night_time, webcmd_room_del, webcmd_room_del_all, webcmd_room_info, webcmd_time},
};

use super::model::EbrdBase;

pub async fn receiver(db: DbConn, mut rx: Receiver<Box<dyn EbrdBase>>, tx_ws: broadcast::Sender<Box<String>>) {
  loop {
    let cmd = rx.recv().await;

    log::info!("receive ebrd cmd {:?}", cmd);
    if cmd.is_none() {
      log::error!("ebrd cmd is None");
      break;
    }
    let ebrd_enable = crate::util::get_env_bool("EBRD_ENABLE", false);
    if !ebrd_enable {
      log::info!("ebrd is not enable");
      continue;
    }

    let db = db.clone();
    let tx_ws = tx_ws.clone();
    // 명령어 처리 루틴은 spawn 안에서 동작하므로, panic 가 발생하더라도, 전체 프로세스에 영향을 주지 않음.
    tokio::spawn(async move {
      let mut cmd = cmd.unwrap();

      if let Some(cmd) = cmd.downcast_mut::<EbrdWebTime>() {
        let _ = webcmd_time::do_webcmd_time(db, cmd, tx_ws).await;
      } else if let Some(cmd) = cmd.downcast_mut::<EbrdWebRoomDel>() {
        let _ = webcmd_room_del::do_webcmd(db, cmd, tx_ws).await;
      } else if let Some(cmd) = cmd.downcast_mut::<EbrdWebRoomDelAll>() {
        let _ = webcmd_room_del_all::do_webcmd(db, cmd, tx_ws).await;
      } else if let Some(cmd) = cmd.downcast_mut::<EbrdWebOperNightTime>() {
        let _ = webcmd_oper_night_time::do_webcmd(db, cmd, tx_ws).await;
      } else if let Some(cmd) = cmd.downcast_mut::<EbrdWebRoomInfo>() {
        let _ = webcmd_room_info::do_webcmd(db, cmd, tx_ws).await;
      } else {
        log::error!("downcast fail cmd:{:?}", cmd);
      }
    });

    // let cmd = cmd.unwrap();

    // if let Some(cmd) = cmd.downcast_ref::<EbrdWebTime>() {
    //   log::info!("ebrd cmd time: {}", cmd.ebrd_seq);
    //   tokio::spawn(webcmd_time::do_webcmd_time(db.clone(), &mut cmd, tx_ws.clone()));
    // } else {
    //   log::error!("ebrd cmd downcast fail");
    // }

    // 데이터 비교한 다음, 상태 저장하도록.
    //log::info!("ndms base unwrap cmd:{:?}", cmd);
    // if let Some(cmd) = cmd.downcast_ref::<NdmsGate>() {
    //   tokio::spawn(ndms_gate::do_ndms_gate(db.clone(), cmd.clone()));
    // } else if let Some(cmd) = cmd.downcast_ref::<NdmsWater>() {
    //   tokio::spawn(ndms_water::do_ndms_water(db.clone(), cmd.clone()));
    // } else {
    //   log::error!("downcase fail cmd:{:?}", cmd);
    // }
  }
}
