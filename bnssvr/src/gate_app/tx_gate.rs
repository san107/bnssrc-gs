use crate::gate_app;
use lazy_static::lazy_static;

#[allow(dead_code)]
pub struct TxCtx {
  tx: Option<tokio::sync::mpsc::Sender<Box<dyn gate_app::IfGateCmd>>>,
}

lazy_static! {
  static ref TXCTX: Arc<Mutex<TxCtx>> = Arc::from(Mutex::from(TxCtx { tx: None }));
}

use std::sync::Arc;
use tokio::sync::Mutex;

pub async fn init(tx: tokio::sync::mpsc::Sender<Box<dyn gate_app::IfGateCmd>>) {
  log::info!("init gate tx");
  let mut ctx = TXCTX.lock().await;
  ctx.tx = Some(tx);
}

#[allow(dead_code)]
pub async fn send_gate_cmd(cmd: Box<dyn gate_app::IfGateCmd>) {
  let ctx = TXCTX.lock().await;
  if ctx.tx.is_none() {
    log::error!("tx is none");
    return;
  }
  let tx = ctx.tx.as_ref().unwrap();
  match tx.send(cmd).await {
    Ok(_) => (),
    Err(e) => log::error!("gate send error: {}", e),
  }
}
