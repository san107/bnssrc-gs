use lazy_static::lazy_static;
use sea_orm::DbConn;
use std::{collections::HashMap, sync::Arc};
use tokio::sync::{broadcast, mpsc::Sender, Mutex};

use crate::ebrd_app::{app_cmd_loop, app_disp_msg, app_stat};

use super::model::EbrdBase;

#[allow(dead_code)]
struct TxCtx {
  tx: Option<Sender<Box<dyn EbrdBase>>>,
  map: HashMap<i32, Arc<Mutex<()>>>, // 중복 방지용.(stat_hander와 receiver 간의 중복 방지용)
}

lazy_static! {
  static ref TXCTX: Arc<Mutex<TxCtx>> = Arc::from(Mutex::from(TxCtx {
    tx: None,
    map: HashMap::new(),
  }));
}

pub async fn init(db: DbConn, tx_ws: broadcast::Sender<Box<String>>) {
  log::info!("init ebrd app");
  let (tx, rx) = tokio::sync::mpsc::channel::<Box<dyn EbrdBase>>(50);
  tokio::spawn(app_stat::stat_handler(db.clone(), tx_ws.clone()));
  tokio::spawn(app_disp_msg::disp_msg_handler(db.clone(), tx_ws.clone()));
  tokio::spawn(app_cmd_loop::receiver(db, rx, tx_ws));

  let mut ctx = TXCTX.lock().await;
  ctx.tx = Some(tx);
}

pub async fn send_ebrd_cmd(cmd: Box<dyn EbrdBase>) {
  let ctx = TXCTX.lock().await;
  if ctx.tx.is_none() {
    log::error!("tx is none ");
    return;
  }
  let tx = ctx.tx.as_ref().unwrap();
  match tx.send(cmd).await {
    Ok(_) => (),
    Err(e) => log::error!("ebrd send error: {}", e),
  }
}

// #[allow(dead_code)]
// pub async fn ndms_send_gate(cmd: NdmsGate) {
//   let ctx = TXCTX.lock().await;
//   if ctx.tx.is_none() {
//     log::error!("tx is none ");
//     return;
//   }
//   let tx = ctx.tx.as_ref().unwrap();
//   _ = tx.send(Box::from(cmd)).await;
// }

// #[allow(dead_code)]
// pub async fn ndms_send_gate_detail(gate_seq: i32, stat: GateStatus, rslt: GateCmdRsltType) {
//   let ctx = TXCTX.lock().await;
//   if ctx.tx.is_none() {
//     log::error!("tx is none ");
//     return;
//   }
//   let comm_sttus = match rslt {
//     GateCmdRsltType::Success => Some("1".to_owned()),
//     GateCmdRsltType::ModeErr => Some("1".to_owned()),
//     GateCmdRsltType::Fail => Some("0".to_owned()),
//   };
//   // stat값을 DB에 저장할 수 있도록 변환.
//   let intrcp_sttus = match rslt {
//     GateCmdRsltType::Success | GateCmdRsltType::ModeErr => match stat {
//       GateStatus::UpLock => Some(NdmsGateIntrcpSttus::UpLock),
//       GateStatus::DownOk => Some(NdmsGateIntrcpSttus::DownLock),
//       GateStatus::UpOk => Some(NdmsGateIntrcpSttus::UpLock),
//       GateStatus::Fault => Some(NdmsGateIntrcpSttus::Error),
//       _ => None,
//     },
//     GateCmdRsltType::Fail => None,
//   };

//   let intrcp_sttus = match intrcp_sttus {
//     Some(v) => match v {
//       NdmsGateIntrcpSttus::Error => Some("0".to_owned()),
//       NdmsGateIntrcpSttus::UpLock => Some("1".to_owned()),
//       NdmsGateIntrcpSttus::DownLock => Some("2".to_owned()),
//       NdmsGateIntrcpSttus::Auto => Some("3".to_owned()),
//       NdmsGateIntrcpSttus::LongUp => Some("4".to_owned()),
//     },
//     None => None,
//   };

//   let tx = ctx.tx.as_ref().unwrap();
//   _ = tx
//     .send(Box::from(NdmsGate {
//       gate_seq,
//       comm_sttus,
//       intrcp_sttus,
//     }))
//     .await;
// }

// #[allow(dead_code)]
// pub async fn ndms_send_gate_detail_backup(
//   seq: i32,
//   comm_sttus: Option<NdmsGateCommSttus>,
//   gate_sttus: Option<NdmsGateIntrcpSttus>,
// ) {
//   let ctx = TXCTX.lock().await;
//   if ctx.tx.is_none() {
//     log::error!("tx is none ");
//     return;
//   }
//   let comm_sttus = match comm_sttus {
//     Some(v) => match v {
//       NdmsGateCommSttus::Normal => Some("1".to_owned()),
//       NdmsGateCommSttus::Error => Some("0".to_owned()),
//     },
//     None => None,
//   };
//   let intrcp_sttus = match gate_sttus {
//     Some(v) => match v {
//       NdmsGateIntrcpSttus::Error => Some("0".to_owned()),
//       NdmsGateIntrcpSttus::UpLock => Some("1".to_owned()),
//       NdmsGateIntrcpSttus::DownLock => Some("2".to_owned()),
//       NdmsGateIntrcpSttus::Auto => Some("3".to_owned()),
//       NdmsGateIntrcpSttus::LongUp => Some("4".to_owned()),
//     },
//     None => None,
//   };
//   let tx = ctx.tx.as_ref().unwrap();
//   _ = tx
//     .send(Box::from(NdmsGate {
//       gate_seq: seq,
//       comm_sttus,
//       intrcp_sttus,
//     }))
//     .await;
// }

// #[allow(dead_code)]
// pub async fn ndms_send_water(cmd: NdmsWater) {
//   let ctx = TXCTX.lock().await;
//   if ctx.tx.is_none() {
//     log::error!("tx is none ");
//     return;
//   }
//   let tx = ctx.tx.as_ref().unwrap();
//   _ = tx.send(Box::from(cmd)).await;
// }
