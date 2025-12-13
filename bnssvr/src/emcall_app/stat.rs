use super::{
  get_emcall_grp_send_url,
  model::{ItgStatErr, ItgStatSend, ItgStatWrap},
};
use crate::{
  emcall_app,
  entities::tb_emcall_grp_stat_hist,
  models::cd::CommStat,
  svc::emcall::{svc_emcall_grp, svc_emcall_grp_stat_hist},
  ws::wsmodels::{WsCmd, WsMsg},
};
use chrono::Local;
use sea_orm::{DbConn, TryIntoModel};
use tokio::sync::broadcast;

/**
 * 성공 이벤츠 처리
 */
pub async fn do_stat_ok(db: DbConn, wrap: &ItgStatWrap, tx_ws: broadcast::Sender<Box<String>>) {
  let hist = tb_emcall_grp_stat_hist::Model {
    emcall_grp_stat_hist_seq: -1,
    emcall_grp_id: wrap.stat.device_id.clone(),
    comm_stat: CommStat::Ok.to_string(),
    emcall_grp_stat_dt: Local::now().naive_local(),
    user_id: wrap.user_id.clone(),
    comm_stat_msg: String::new(),
    emcall_grp_stat_json: serde_json::to_string(&wrap.stat).ok(),
  };

  let comm_stat = hist.comm_stat.clone();
  let json = serde_json::to_string(&wrap.stat).ok();
  log::info!("do_evt: {:?}", hist);
  let rslt = svc_emcall_grp_stat_hist::mtn::Mtn::save(&db, hist).await;
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
    cmd: WsCmd::EmcallStat,
    data: model,
  };
  let msg = serde_json::to_string(&ws_msg).unwrap();
  let rslt = tx_ws.send(Box::new(msg));
  if let Err(e) = rslt.as_ref() {
    log::error!("do_evt error: {:?}", e);
    return;
  }
  let rslt = svc_emcall_grp::mtn::Mtn::update_stat_json_by_key(&db, wrap.emcall_grp_seq, comm_stat, json).await;
  if let Err(e) = rslt.as_ref() {
    log::error!("do_evt error: {:?}", e);
    return;
  }
}

fn tx_send_msg(tx: tokio::sync::oneshot::Sender<Result<(), String>>, msg: Result<(), String>) {
  let rslt = tx.send(msg);
  if let Err(e) = rslt.as_ref() {
    log::error!("tx_send_err_msg error: {:?}", e);
  }
}

pub async fn do_stat_send(db: DbConn, send: &mut ItgStatSend, tx_ws: broadcast::Sender<Box<String>>) {
  let wrap = send.wrap.clone();
  let tx = send.tx.take().unwrap();

  let rslt = do_stat_request(db.clone(), wrap.clone()).await;
  if let Err(e) = rslt.as_ref() {
    let msg = format!("do_stat_request error: {:?}", e);
    log::error!("{}", msg);
    tx_send_msg(tx, Err(msg));
    return;
  }

  let rslt = do_stat_save(db, tx_ws, wrap).await;
  if let Err(e) = rslt.as_ref() {
    let msg = format!("do_stat_save error: {:?}", e);
    log::error!("{}", msg);
    tx_send_msg(tx, Err(msg));
    return;
  }
  tx_send_msg(tx, Ok(()));
}

async fn do_stat_request(db: sea_orm::DatabaseConnection, wrap: ItgStatWrap) -> Result<(), String> {
  let model = svc_emcall_grp::qry::Qry::find_by_id(&db, wrap.emcall_grp_seq).await;
  if let Err(e) = model.as_ref() {
    let msg = format!("do_stat_request error: {:?}", e);
    log::error!("{}", msg);
    return Err(msg);
  }
  let model = model.unwrap();
  if model.is_none() {
    let msg = format!("do_stat_request error: emcall_grp_seq not found");
    log::error!("{}", msg);
    return Err(msg);
  }
  let model = model.unwrap();

  let url = get_emcall_grp_send_url(&model);

  emcall_app::send_emcall_grp_stat(url, wrap.stat).await
}

async fn do_stat_save(
  db: sea_orm::DatabaseConnection,
  tx_ws: broadcast::Sender<Box<String>>,
  wrap: ItgStatWrap,
) -> Result<(), String> {
  let hist = tb_emcall_grp_stat_hist::Model {
    emcall_grp_stat_hist_seq: -1,
    emcall_grp_id: wrap.stat.device_id.clone(),
    comm_stat: CommStat::Ok.to_string(),
    emcall_grp_stat_dt: Local::now().naive_local(),
    user_id: wrap.user_id.clone(),
    comm_stat_msg: String::new(),
    emcall_grp_stat_json: serde_json::to_string(&wrap.stat).ok(),
  };
  let comm_stat = hist.comm_stat.clone();
  let json = serde_json::to_string(&wrap.stat).ok();
  log::info!("do_stat_save: {:?}", hist);
  let rslt = svc_emcall_grp_stat_hist::mtn::Mtn::save(&db, hist).await;
  if let Err(e) = rslt.as_ref() {
    let msg = format!("do_stat_save error: {:?}", e);
    log::error!("{}", msg);
    return Err(msg);
  }
  let rslt = rslt.unwrap();
  let model = rslt.try_into_model();
  if let Err(e) = model.as_ref() {
    let msg = format!("do_stat_save error: {:?}", e);
    log::error!("{}", msg);
    return Err(msg);
  }
  let model = model.unwrap();
  log::info!("do_stat_save result : {:?}", model);
  let ws_msg = WsMsg {
    cmd: WsCmd::EmcallStat,
    data: model,
  };
  let msg = serde_json::to_string(&ws_msg).unwrap();
  let rslt = tx_ws.send(Box::new(msg));
  if let Err(e) = rslt.as_ref() {
    let msg = format!("do_stat_save error: {:?}", e);
    log::error!("{}", msg);
    return Err(msg);
  }
  let rslt = svc_emcall_grp::mtn::Mtn::update_stat_json_by_key(&db, wrap.emcall_grp_seq, comm_stat, json).await;

  if let Err(e) = rslt.as_ref() {
    let msg = format!("do_stat_save error: {:?}", e);
    log::error!("{}", msg);
    return Err(msg);
  }
  Ok(())
}

pub async fn do_stat_err(db: DbConn, err: &ItgStatErr, tx_ws: broadcast::Sender<Box<String>>) {
  let hist = tb_emcall_grp_stat_hist::Model {
    emcall_grp_stat_hist_seq: -1,
    emcall_grp_id: err.device_id.clone(),
    comm_stat_msg: err.err_msg.clone(),
    emcall_grp_stat_dt: Local::now().naive_local(),
    user_id: err.user_id.clone(),
    comm_stat: CommStat::Err.to_string(),
    emcall_grp_stat_json: None,
  };

  let comm_stat = hist.comm_stat.clone();

  log::info!("do_evt_err: {:?}", hist);
  let rslt = svc_emcall_grp_stat_hist::mtn::Mtn::save(&db, hist).await;
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
    cmd: WsCmd::EmcallStat,
    data: model,
  };
  let msg = serde_json::to_string(&ws_msg).unwrap();
  let rslt = tx_ws.send(Box::new(msg));
  if let Err(e) = rslt.as_ref() {
    log::error!("do_evt error: {:?}", e);
    return;
  }
  let rslt = svc_emcall_grp::mtn::Mtn::update_comm_stat_by_key(&db, err.emcall_grp_seq, comm_stat).await;
  if let Err(e) = rslt.as_ref() {
    log::error!("do_evt error: {:?}", e);
    return;
  }
}
