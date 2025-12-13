use log::{debug, error};
use tokio::sync::broadcast;
use wsmodels::{WsCmd, WsMsg};

pub mod routes;
mod testecho;
mod wsevent;
pub mod wsmodels;
pub mod wssender;

pub async fn monitor(mut rx: broadcast::Receiver<Box<String>>) {
  loop {
    match rx.recv().await {
      Ok(msg) => {
        debug!("websocket message : {msg}");
      }
      Err(e) => {
        error!("broade cast channel recv error {e:?}");
        break;
      }
    }
  }
}

#[allow(dead_code)]
pub async fn testtx(tx: broadcast::Sender<Box<String>>) {
  loop {
    tokio::time::sleep(tokio::time::Duration::from_millis(2000)).await;
    let msg = WsMsg {
      cmd: WsCmd::Test,
      data: "테스트입니다".to_owned(),
    };
    match tx.send(Box::from(serde_json::to_string(&msg).unwrap())) {
      Ok(_) => {}
      Err(e) => {
        error!("send error {e:?}");
      }
    }
  }
}
