use crate::{
  models::cd::{CommStat, WaterMod},
  svc::water::svc_water,
  util,
  water::{self, recv_worker::WaterRecvCmd},
  ws::wssender,
};
use chrono::Local;
use sea_orm::DatabaseConnection;
use std::time::Duration;
use tokio::time;

pub async fn stat_worker(db: DatabaseConnection, _tx_ws: tokio::sync::broadcast::Sender<Box<String>>) {
  // 주기적으로, 모든 수위계에 대해 상태를 확인하고, 상태를 업데이트한다.
  let mut interval = time::interval(time::Duration::from_secs(60)); // 1분간격으로 실행.
                                                                    //let comm_err_secs = util::get_env_i32("WATER_ERR_SECS", 5 * 60);
  let comm_err_secs = util::get_env_i32("WATER_ERR_SECS", 3 * 60);
  loop {
    interval.tick().await;
    log::info!("water stat_worker interval 60 secs");
    // 전체 수위계데이터를 읽어와서 상태를 확인하고, 업데이트한다.
    // 다른쪽에서 작업을 수행하고 있을지 모르므로, 상태만 업데이트 한다.
    // 업데이트 조건은, 상태가 다른 경우에 업데이트하고, 업데이트 후에는, 웹소켓으로 상태변경을 전송한다.
    let list = svc_water::qry::Qry::find_all(&db).await;
    if let Err(e) = list {
      log::error!("water stat_worker find_all error : {:?}", e);
      continue;
    }
    let list = list.unwrap();
    for item in list {
      log::debug!("water stat_worker item : {}({})", item.water_nm, item.water_seq);
      // let stat = svc_water::get_water_stat(item.clone());
      // if stat != item.stat {
      //   let _ = svc_water::update_stat(&db, item.id, stat).await;
      //   // 웹소켓으로 상태변경을 전송한다.
      //   let _ = svc_water::send_ws_stat(_tx_ws.clone(), item.id, stat).await;
      // }
      if item.water_dt == None {
        // 데이터를 수신하지 않았으므로, 통신상태를 Err로 처리함.
        let comm_stat = CommStat::Err;
        if item.comm_stat != Some(comm_stat.to_string()) {
          let _ = svc_water::mtn::Mtn::update_comm_stat(&db, item.water_seq, comm_stat).await;
          if item.water_mod == WaterMod::Grp.to_string() {
            water::recv_worker::send(WaterRecvCmd::GrpCommStat(item.water_seq, comm_stat)).await;
          }
          // 웹소켓으로 상태변경을 전송한다.
          wssender::send_ws_water_stat(item.water_seq, comm_stat).await;
        }
        continue;
      }

      //let t = Local::now() - Duration::from_secs(5 * 60);
      let t = Local::now() - Duration::from_secs(comm_err_secs as u64);
      if item.water_dt.unwrap() < t.naive_local() {
        // 5분이상 데이터를 수신하지 않았으므로, 통신상태를 Err로 처리함.
        let comm_stat = CommStat::Err;
        if item.comm_stat != Some(comm_stat.to_string()) {
          let _ = svc_water::mtn::Mtn::update_comm_stat(&db, item.water_seq, comm_stat).await;
          if item.water_mod == WaterMod::Grp.to_string() {
            water::recv_worker::send(WaterRecvCmd::GrpCommStat(item.water_seq, comm_stat)).await;
          }
          // 웹소켓으로 상태변경을 전송한다.
          wssender::send_ws_water_stat(item.water_seq, comm_stat).await;
        }
      } else {
        // 통신상태가 Err이면, Ok로 변경한다.
        let comm_stat = CommStat::Ok;
        if item.comm_stat != Some(comm_stat.to_string()) {
          let _ = svc_water::mtn::Mtn::update_comm_stat(&db, item.water_seq, comm_stat).await;
          if item.water_mod == WaterMod::Grp.to_string() {
            water::recv_worker::send(WaterRecvCmd::GrpCommStat(item.water_seq, comm_stat)).await;
          }
          // 웹소켓으로 상태변경을 전송한다.
          wssender::send_ws_water_stat(item.water_seq, comm_stat).await;
        }
      }
    }
  }
}
