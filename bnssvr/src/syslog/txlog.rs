use lazy_static::lazy_static;

#[allow(dead_code)]
pub struct TxCtx {
  tx: Option<tokio::sync::mpsc::Sender<Syslog>>,
}

lazy_static! {
  static ref TXCTX: Arc<Mutex<TxCtx>> = Arc::from(Mutex::from(TxCtx { tx: None }));
}

use std::sync::Arc;
use tokio::sync::Mutex;

use crate::syslog::Syslog;

pub async fn init(tx: tokio::sync::mpsc::Sender<Syslog>) {
  log::info!("init gate tx");
  let mut ctx = TXCTX.lock().await;
  ctx.tx = Some(tx);
}

pub mod syslog {
  #[allow(dead_code)]
  pub async fn send(l: super::Syslog) {
    let ctx = super::TXCTX.lock().await;
    if ctx.tx.is_none() {
      log::error!("tx is none");
      return;
    }
    let tx = ctx.tx.as_ref().unwrap();
    match tx.send(l).await {
      Ok(_) => (),
      Err(e) => log::error!("syslog send error: {}", e),
    }
  }
}

pub mod raw {
  use crate::syslog::{LogLevel, LogType, Syslog};

  #[allow(dead_code)]
  pub async fn send(user_id: &str, lvl: LogLevel, lty: LogType, msg: &str, json: serde_json::Value) {
    let syslog = Syslog {
      user_id: user_id.to_string(),
      lvl,
      lty,
      msg: msg.to_string(),
      json,
    };
    let ctx = super::TXCTX.lock().await;
    if ctx.tx.is_none() {
      log::error!("tx is none");
      return;
    }
    let tx = ctx.tx.as_ref().unwrap();
    match tx.send(syslog).await {
      Ok(_) => (),
      Err(e) => log::error!("syslog send error: {}", e),
    }
  }
}

pub mod demon {
  use crate::syslog::{LogLevel, LogType, Syslog};

  #[allow(dead_code)]
  pub async fn send(lvl: LogLevel, lty: LogType, msg: &str, json: serde_json::Value) {
    let syslog = Syslog {
      user_id: "[DEMON]".to_string(),
      lvl,
      lty,
      msg: msg.to_string(),
      json,
    };
    let ctx = super::TXCTX.lock().await;
    if ctx.tx.is_none() {
      log::error!("tx is none");
      return;
    }
    let tx = ctx.tx.as_ref().unwrap();
    match tx.send(syslog).await {
      Ok(_) => (),
      Err(e) => log::error!("syslog send error: {}", e),
    }
  }
}
