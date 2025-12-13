use super::model::{EmcallBase, ItgEvent};
use crate::{
  emcall_app::{
    app_evt, app_stat, evt,
    model::{ItgEventErr, ItgStatErr, ItgStatSend, ItgStatWrap},
    stat,
  },
  water::{self, recv_worker::WaterRecvCmd},
};
use lazy_static::lazy_static;
use sea_orm::DbConn;
use std::{collections::HashMap, sync::Arc, time::Instant};
use tokio::sync::{
  broadcast,
  mpsc::{Receiver, Sender},
  Mutex,
};

#[allow(dead_code)]
pub struct TxCtx {
  pub tx: Option<Sender<Box<dyn EmcallBase>>>,
  pub emcall_map: HashMap<String, Instant>, // 중복 방지용.(stat_hander와 receiver 간의 중복 방지용)
}

lazy_static! {
  static ref TXCTX: Arc<Mutex<TxCtx>> = Arc::from(Mutex::from(TxCtx {
    tx: None,
    emcall_map: HashMap::new(),
  }));
}

#[allow(unused_variables)]
async fn cmd_receiver(db: DbConn, mut rx: Receiver<Box<dyn EmcallBase>>, tx_ws: broadcast::Sender<Box<String>>) {
  loop {
    let cmd = rx.recv().await;

    log::info!("receive emcall cmd {:?}", cmd);
    if cmd.is_none() {
      log::error!("emcall cmd is None");
      break;
    }
    let emcall_enable = crate::util::get_env_bool("EMCALL_ENABLE", false);
    if !emcall_enable {
      log::info!("emcall is not enable");
      continue;
    }
    let db = db.clone();
    let tx_ws = tx_ws.clone();
    tokio::spawn(async move {
      let mut cmd = cmd.unwrap();

      if let Some(cmd) = cmd.downcast_ref::<ItgEvent>() {
        do_itg_event(&db, &tx_ws, cmd).await;
        water::recv_worker::send(WaterRecvCmd::ItgEvt(cmd.clone())).await; //
      } else if let Some(cmd) = cmd.downcast_ref::<ItgEventErr>() {
        log::info!("itg event cmd:{:?}", cmd);
        evt::do_evt_err(db, cmd, tx_ws).await;
      } else if let Some(cmd) = cmd.downcast_ref::<ItgStatWrap>() {
        log::info!("itg stat cmd:{:?}", cmd);
        stat::do_stat_ok(db, cmd, tx_ws).await;
      } else if let Some(cmd) = cmd.downcast_ref::<ItgStatErr>() {
        log::info!("itg stat err cmd:{:?}", cmd);
        stat::do_stat_err(db, cmd, tx_ws).await;
      } else if let Some(cmd) = cmd.downcast_mut::<ItgStatSend>() {
        log::info!("itg stat send cmd:{:?}", cmd);
        stat::do_stat_send(db, cmd, tx_ws).await;
      } else {
        log::error!("downcast fail cmd:{:?}", cmd);
      }
    });
  }
}

async fn do_itg_event(db: &sea_orm::DatabaseConnection, tx_ws: &broadcast::Sender<Box<String>>, cmd: &ItgEvent) {
  log::info!("itg event cmd:{:?}", cmd);
  if cmd.event_type.as_str() == "B_ALIVE" {
    // skip.
    log::info!("B_ALIVE");
    evt::do_evt_alive(db.clone(), cmd, tx_ws.clone()).await;
  } else {
    evt::do_evt_ok(db.clone(), cmd, tx_ws.clone()).await;
  }
  // 수신이력을 데이터베이스에 저장하고, 웹소켓으로 해당 메시지 전송하록.

  {
    // 수신시각 기록.
    let mut ctx = TXCTX.lock().await;
    ctx.emcall_map.insert(cmd.device_id.clone(), Instant::now());
  }
}

pub async fn init(db: DbConn, tx_ws: broadcast::Sender<Box<String>>) {
  log::info!("init emcall app");
  let (tx, rx) = tokio::sync::mpsc::channel::<Box<dyn EmcallBase>>(50);
  app_stat::start_stat_app(&TXCTX, &db, &tx_ws); // 이
  app_evt::start_evt_app(&TXCTX, &db); // 이 함수 안에서 spawn 처리함.
  tokio::spawn(cmd_receiver(db, rx, tx_ws));

  let mut ctx = TXCTX.lock().await;
  ctx.tx = Some(tx);
}

pub async fn emcall_send(cmd: Box<dyn EmcallBase>) {
  log::info!("emcall_send: {:?}", cmd);
  let ctx = TXCTX.lock().await;
  log::info!("emcall_send get ctx ok ");
  if ctx.tx.is_none() {
    log::error!("tx is none ");
    return;
  }
  let tx = ctx.tx.as_ref().unwrap();
  match tx.send(cmd).await {
    Ok(_) => (),
    Err(e) => log::error!("emcall send error: {}", e),
  }
}

pub async fn emcall_send_with_ctx(ctx: &TxCtx, cmd: Box<dyn EmcallBase>) {
  log::info!("emcall_send: {:?}", cmd);

  if ctx.tx.is_none() {
    log::error!("tx is none ");
    return;
  }
  let tx = ctx.tx.as_ref().unwrap();
  match tx.send(cmd).await {
    Ok(_) => (),
    Err(e) => log::error!("emcall send error: {}", e),
  }
}
