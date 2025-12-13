use super::model::{ItgEvent, ItgEventErr};
use crate::{
  entities::tb_emcall_evt_hist,
  models::cd::CommStat,
  svc::emcall::{svc_emcall, svc_emcall_evt_hist},
  ws::wsmodels::{WsCmd, WsMsg},
};
use chrono::Local;
use sea_orm::{DbConn, TryIntoModel};
use tokio::sync::broadcast;

/**
 * 성공 이벤츠 처리
 */
pub async fn do_evt_ok(db: DbConn, evt: &ItgEvent, tx_ws: broadcast::Sender<Box<String>>) {
  let evt_hist = tb_emcall_evt_hist::Model {
    emcall_evt_hist_seq: -1,
    emcall_id: evt.device_id.clone(),
    comm_stat: CommStat::Ok.to_string(),
    emcall_evt_type: evt.event_type.clone(),
    emcall_evt_dt: Local::now().naive_local(),
  };

  let comm_stat = evt_hist.comm_stat.clone();

  log::info!("do_evt: {:?}", evt_hist);
  let rslt = svc_emcall_evt_hist::mtn::Mtn::save(&db, evt_hist).await;
  if let Err(e) = rslt.as_ref() {
    log::error!("do_evt error: {:?}", e);
    return;
  }
  let rslt = rslt.unwrap();
  let model = rslt.try_into_model();
  if let Err(e) = model.as_ref() {
    log::error!("do_evt error: {:?}", e);
    return;
  }
  let model = model.unwrap();
  log::info!("do_evt result : {:?}", model);

  let ws_msg = WsMsg {
    cmd: WsCmd::EmcallEvt,
    data: model,
  };
  let msg = serde_json::to_string(&ws_msg).unwrap();
  let rslt = tx_ws.send(Box::new(msg));
  if let Err(e) = rslt.as_ref() {
    log::error!("do_evt error: {:?}", e);
    return;
  }
  let rslt = svc_emcall::mtn::Mtn::update_comm_stat_by_id(&db, evt.device_id.clone(), comm_stat).await;
  if let Err(e) = rslt.as_ref() {
    log::error!("do_evt error: {:?}", e);
    return;
  }
}

pub async fn do_evt_alive(db: DbConn, evt: &ItgEvent, tx_ws: broadcast::Sender<Box<String>>) {
  // 먼저 상태를 체크해서 정상인 경우, 아무것도 하지 않음.
  let rslt = svc_emcall::qry::Qry::find_by_emcall_id(&db, &evt.device_id).await;
  if let Err(e) = rslt.as_ref() {
    log::error!("do_evt error: {:?}", e);
    return;
  }
  let rslt = rslt.unwrap();
  if rslt.is_none() {
    log::error!("do_evt error: {:?}", "Not Found");
    return;
  }
  let obj = rslt.unwrap();
  if obj.comm_stat.is_some() && obj.comm_stat.unwrap() == CommStat::Ok.to_string() {
    log::info!("do_evt status is ok. skip alive event ");
    return;
  }

  // let ws_msg = WsMsg {
  //   cmd: WsCmd::EmcallStat,
  //   data: evt,
  // };
  // let msg = serde_json::to_string(&ws_msg).unwrap();
  // let rslt = tx_ws.send(Box::new(msg));
  // if let Err(e) = rslt.as_ref() {
  //   log::error!("do_evt error: {:?}", e);
  //   return;
  // }

  do_evt_ok(db, evt, tx_ws).await;
}

pub async fn do_evt_err(db: DbConn, evt: &ItgEventErr, tx_ws: broadcast::Sender<Box<String>>) {
  let evt_hist = tb_emcall_evt_hist::Model {
    emcall_evt_hist_seq: -1,
    emcall_id: evt.device_id.clone(),
    comm_stat: CommStat::Err.to_string(),
    emcall_evt_type: "".to_string(),
    emcall_evt_dt: Local::now().naive_local(),
  };

  let comm_stat = evt_hist.comm_stat.clone();

  log::info!("do_evt_err: {:?}", evt_hist);
  let rslt = svc_emcall_evt_hist::mtn::Mtn::save(&db, evt_hist).await;
  if let Err(e) = rslt.as_ref() {
    log::error!("do_evt error: {:?}", e);
    return;
  }
  let rslt = rslt.unwrap();
  let model = rslt.try_into_model();
  if let Err(e) = model.as_ref() {
    log::error!("do_evt error: {:?}", e);
    return;
  }
  let model = model.unwrap();
  log::info!("do_evt result : {:?}", model);

  let ws_msg = WsMsg {
    cmd: WsCmd::EmcallEvt,
    data: model,
  };
  let msg = serde_json::to_string(&ws_msg).unwrap();
  let rslt = tx_ws.send(Box::new(msg));
  if let Err(e) = rslt.as_ref() {
    log::error!("do_evt error: {:?}", e);
    return;
  }
  let rslt = svc_emcall::mtn::Mtn::update_comm_stat_by_id(&db, evt.device_id.clone(), comm_stat).await;
  if let Err(e) = rslt.as_ref() {
    log::error!("do_evt error: {:?}", e);
    return;
  }
}
