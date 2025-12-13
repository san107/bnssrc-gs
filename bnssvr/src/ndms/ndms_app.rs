use super::ndms_model::{NdmsBase, NdmsGateCommSttus, NdmsGateIntrcpSttus};
use crate::{
  models::cd::{GateCmdRsltType, GateStatus},
  ndms::{
    ndms_ebrd, ndms_gate,
    ndms_model::{NdmsEbrd, NdmsGate, NdmsWater},
    ndms_water,
  },
};
use lazy_static::lazy_static;
use sea_orm::DbConn;
use std::sync::Arc;
use tokio::sync::{
  mpsc::{Receiver, Sender},
  Mutex,
};

struct TxCtx {
  tx: Option<Sender<Box<dyn NdmsBase>>>,
}

lazy_static! {
  static ref TXCTX: Arc<Mutex<TxCtx>> = Arc::from(Mutex::from(TxCtx { tx: None }));
}

async fn receiver(db: DbConn, mut rx: Receiver<Box<dyn NdmsBase>>) {
  loop {
    let cmd = rx.recv().await;
    log::info!("receive ndms cmd {:?}", cmd);
    if cmd.is_none() {
      log::error!("ndms cmd is None");
      break;
    }
    let ndms_enable = crate::util::get_env_bool("NDMS_ENABLE", false);
    if !ndms_enable {
      log::info!("ndms is not enable");
      continue;
    }
    let cmd = cmd.unwrap();
    // 데이터 비교한 다음, 상태 저장하도록.
    //log::info!("ndms base unwrap cmd:{:?}", cmd);
    if let Some(cmd) = cmd.downcast_ref::<NdmsGate>() {
      tokio::spawn(ndms_gate::do_ndms_gate(db.clone(), cmd.clone()));
    } else if let Some(cmd) = cmd.downcast_ref::<NdmsWater>() {
      tokio::spawn(ndms_water::do_ndms_water(db.clone(), cmd.clone()));
    } else if let Some(cmd) = cmd.downcast_ref::<NdmsEbrd>() {
      tokio::spawn(ndms_ebrd::do_ndms_ebrd(db.clone(), cmd.clone()));
    } else {
      log::error!("downcase fail cmd:{:?}", cmd);
    }
  }
}

pub async fn init(db: DbConn) {
  log::info!("init ndms app");
  let (tx, rx) = tokio::sync::mpsc::channel::<Box<dyn NdmsBase>>(50);
  tokio::spawn(receiver(db, rx));

  let mut ctx = TXCTX.lock().await;
  ctx.tx = Some(tx);
}

#[allow(dead_code)]
pub async fn ndms_send_gate(cmd: NdmsGate) {
  let ctx = TXCTX.lock().await;
  if ctx.tx.is_none() {
    log::error!("tx is none ");
    return;
  }
  let tx = ctx.tx.as_ref().unwrap();
  _ = tx.send(Box::from(cmd)).await;
}

#[allow(dead_code)]
pub async fn ndms_send_gate_detail(gate_seq: i32, stat: GateStatus, rslt: GateCmdRsltType) {
  let ctx = TXCTX.lock().await;
  if ctx.tx.is_none() {
    log::error!("tx is none ");
    return;
  }
  let comm_sttus = match rslt {
    GateCmdRsltType::Success => Some("1".to_owned()),
    GateCmdRsltType::ModeErr => Some("1".to_owned()),
    GateCmdRsltType::Fail => Some("0".to_owned()),
  };
  // stat값을 DB에 저장할 수 있도록 변환.
  let intrcp_sttus = match rslt {
    GateCmdRsltType::Success | GateCmdRsltType::ModeErr => match stat {
      GateStatus::UpLock => Some(NdmsGateIntrcpSttus::UpLock),
      GateStatus::DownOk => Some(NdmsGateIntrcpSttus::DownLock),
      GateStatus::UpOk => Some(NdmsGateIntrcpSttus::UpLock),
      GateStatus::Fault => Some(NdmsGateIntrcpSttus::Error),
      _ => None,
    },
    GateCmdRsltType::Fail => None,
  };

  let intrcp_sttus = match intrcp_sttus {
    Some(v) => match v {
      NdmsGateIntrcpSttus::Error => Some("0".to_owned()),
      NdmsGateIntrcpSttus::UpLock => Some("1".to_owned()),
      NdmsGateIntrcpSttus::DownLock => Some("2".to_owned()),
      NdmsGateIntrcpSttus::Auto => Some("3".to_owned()),
      NdmsGateIntrcpSttus::LongUp => Some("4".to_owned()),
    },
    None => None,
  };

  let tx = ctx.tx.as_ref().unwrap();
  _ = tx
    .send(Box::from(NdmsGate {
      gate_seq,
      comm_sttus,
      intrcp_sttus,
    }))
    .await;
}

#[allow(dead_code)]
pub async fn ndms_send_gate_detail_backup(
  seq: i32,
  comm_sttus: Option<NdmsGateCommSttus>,
  gate_sttus: Option<NdmsGateIntrcpSttus>,
) {
  let ctx = TXCTX.lock().await;
  if ctx.tx.is_none() {
    log::error!("tx is none ");
    return;
  }
  let comm_sttus = match comm_sttus {
    Some(v) => match v {
      NdmsGateCommSttus::Normal => Some("1".to_owned()),
      NdmsGateCommSttus::Error => Some("0".to_owned()),
    },
    None => None,
  };
  let intrcp_sttus = match gate_sttus {
    Some(v) => match v {
      NdmsGateIntrcpSttus::Error => Some("0".to_owned()),
      NdmsGateIntrcpSttus::UpLock => Some("1".to_owned()),
      NdmsGateIntrcpSttus::DownLock => Some("2".to_owned()),
      NdmsGateIntrcpSttus::Auto => Some("3".to_owned()),
      NdmsGateIntrcpSttus::LongUp => Some("4".to_owned()),
    },
    None => None,
  };
  let tx = ctx.tx.as_ref().unwrap();
  _ = tx
    .send(Box::from(NdmsGate {
      gate_seq: seq,
      comm_sttus,
      intrcp_sttus,
    }))
    .await;
}

#[allow(dead_code)]
pub async fn ndms_send_water(cmd: NdmsWater) {
  let ctx = TXCTX.lock().await;
  if ctx.tx.is_none() {
    log::error!("tx is none ");
    return;
  }
  let tx = ctx.tx.as_ref().unwrap();
  _ = tx.send(Box::from(cmd)).await;
}

#[allow(dead_code)]
pub async fn ndms_send_ebrd(cmd: NdmsEbrd) {
  let ctx = TXCTX.lock().await;
  if ctx.tx.is_none() {
    log::error!("tx is none ");
    return;
  }
  let tx = ctx.tx.as_ref().unwrap();
  _ = tx.send(Box::from(cmd)).await;
}

pub async fn ndms_send_ebrd_stat(ebrd_seq: i32, comm_stat: &str) {
  ndms_send_ebrd(NdmsEbrd {
    ebrd_seq,
    comm_stat: match comm_stat {
      "Ok" => Some("1".to_owned()), // "1" : 정상, "0" : 오류
      "Err" => Some("0".to_owned()),
      _ => None,
    },
    msg_board: None,
  })
  .await;
}

pub async fn ndms_send_ebrd_disp_msg(ebrd_seq: i32, msg: &str) {
  ndms_send_ebrd(NdmsEbrd {
    ebrd_seq,
    comm_stat: None,
    msg_board: Some(msg.to_owned()),
  })
  .await;
}
