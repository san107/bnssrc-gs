use crate::{
  svc::camera::svc_camera,
  ws::wsmodels::{WsCameraStat, WsCmd, WsMsg},
};
use lazy_static::lazy_static;
use sea_orm::DbConn;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::sync::Arc;
use tokio::sync::{
  broadcast,
  mpsc::{Receiver, Sender},
  Mutex,
};

struct TxCtx {
  tx: Option<Sender<CamCmd>>,
}

#[derive(Debug, Copy, Clone, Deserialize, Serialize, strum::Display, strum::EnumString, PartialEq)]
pub enum CamStat {
  Err,
  Ok,
}

#[derive(Debug, Deserialize, Serialize, Copy, Clone)]
#[allow(dead_code)]
pub struct CamCmd {
  pub cam_seq: i32,
  pub cam_stat: CamStat,
}

lazy_static! {
  static ref TXCTX: Arc<Mutex<TxCtx>> = Arc::from(Mutex::from(TxCtx { tx: None }));
}

async fn send_ws_msg(tx_ws: &broadcast::Sender<Box<String>>, cmd: &CamCmd) {
  let msg = WsMsg {
    cmd: WsCmd::CameraStat,
    data: WsCameraStat {
      cam_seq: cmd.cam_seq,
      cam_stat: cmd.cam_stat,
    },
  };
  let msg: Box<String> = Box::from(json!(msg).to_string());
  _ = tx_ws.send(msg);
}

async fn receiver(db: DbConn, mut rx: Receiver<CamCmd>, tx_ws: broadcast::Sender<Box<String>>) {
  loop {
    let cmd = rx.recv().await;
    log::info!("receive cam stat {:?}", cmd);
    if cmd.is_none() {
      log::error!("cam-cmd is None");
      break;
    }
    let cmd = cmd.unwrap();
    // 데이터 비교한 다음, 상태 저장하도록.
    let model = svc_camera::qry::Qry::find_by_id(&db, cmd.cam_seq).await;
    if let Err(e) = model {
      log::error!("db error {cmd:?} {e:?}");
      continue;
    }
    let model = model.unwrap();
    if model.is_none() {
      log::error!("not found {cmd:?}");
      continue;
    }
    let model = model.unwrap();
    let stat = model.cam_stat;
    if stat.is_none() {
      // 업데이트 해야 함.(초기화 상태가 아니라면, none인경우는 없음. )
      log::warn!("initial status cam_seq {} cam_stat {}", cmd.cam_seq, cmd.cam_stat);
      _ = svc_camera::mtn::Mtn::save_stat(&db, cmd.cam_seq, cmd.cam_stat).await;
      // 웹소켓 전송.
      send_ws_msg(&tx_ws, &cmd).await;
      continue;
    }
    let stat = stat.unwrap();
    if stat == cmd.cam_stat.to_string() {
      // 동일하여 아무것도 하지 않음.
      continue;
    }
    // 업데이트.
    _ = svc_camera::mtn::Mtn::save_stat(&db, cmd.cam_seq, cmd.cam_stat).await;
    // 웹소켓 전송.
    send_ws_msg(&tx_ws, &cmd).await;
  }
}

pub async fn init(db: DbConn, tx_ws: broadcast::Sender<Box<String>>) {
  log::info!("init rtsp cam_mgr");
  let (tx, rx) = tokio::sync::mpsc::channel::<CamCmd>(50);
  tokio::spawn(receiver(db, rx, tx_ws));

  let mut ctx = TXCTX.lock().await;
  ctx.tx = Some(tx);
}

/**
 * 여기서 전송된 내용은, channel receiver가 받아서 처리함.
 */
pub async fn send_stat(seq: i32, stat: CamStat) {
  let ctx = TXCTX.lock().await;
  if ctx.tx.is_none() {
    log::error!("tx is none seq:{seq} camstat:{stat}");
    return;
  }
  let tx = ctx.tx.as_ref().unwrap();
  _ = tx
    .send(CamCmd {
      cam_seq: seq,
      cam_stat: stat,
    })
    .await;
}
