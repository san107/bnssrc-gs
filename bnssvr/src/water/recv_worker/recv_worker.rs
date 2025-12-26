// bnssvr/src/water/recv_worker/recv_worker.rs
use crate::water::recv_worker::{
  grp_action,
  grp_stat,
  hpcrtn,
  hpcrtn_onoff,
  istec,
  itg,
  types::WaterRecvCmd, // yesung 추가
  yesung,
};
use actix_web::web;
use lazy_static::lazy_static;
use sea_orm::DbConn;
use std::sync::Arc;
use tokio::sync::{mpsc::Sender, Mutex};

pub fn start_worker(db: DbConn) {
  tokio::spawn(receiver(db));
}

async fn receiver(db: DbConn) {
  let (tx, mut rx) = tokio::sync::mpsc::channel::<WaterRecvCmd>(100);
  {
    let mut ctx = CTX.lock().await;
    ctx.tx = Some(tx);
  }

  loop {
    let cmd = rx.recv().await;
    log::info!("receive water cmd {:?}", cmd);
    if cmd.is_none() {
      log::error!("water recv_worker receiver break");
      break;
    }

    let cmd = cmd.unwrap();
    let db = db.clone();

    match cmd {
      WaterRecvCmd::Text(text) => {
        log::info!("receive water cmd {:?}", text);
      }
      WaterRecvCmd::ItgEvt(itg_event) => {
        log::info!("receive water itg event {:?}", itg_event);
        tokio::spawn(itg::handle_itg_event(db, itg_event));
      }
      WaterRecvCmd::IstecEvt(info) => {
        log::info!("receive water istec event {:?}", info);
        tokio::spawn(istec::handle_istec_event(db, web::Json(info)));
      }
      WaterRecvCmd::HpOnoffEvt(gate_seq, onoff1, onoff2) => {
        log::info!(
          "receive water hp onoff gate_seq {} onoff1 {} onoff2 {}",
          gate_seq,
          onoff1,
          onoff2
        );
        tokio::spawn(hpcrtn_onoff::handle_hpcrtn_onoff(db, gate_seq, onoff1, onoff2));
      }
      WaterRecvCmd::HpAnalogEvt(gate_seq, level) => {
        log::info!("receive water hp analog gate_seq {} level {}", gate_seq, level);
        tokio::spawn(hpcrtn::handle_hpcrtn(db, gate_seq, level));
      }
      // 예성 수위계 이벤트 처리 추가
      WaterRecvCmd::YesungOnoffEvt(gate_seq, onoff_3cm, onoff_5cm) => {
        log::info!(
          "receive yesung water onoff gate_seq {} 3cm={} 5cm={}",
          gate_seq,
          onoff_3cm,
          onoff_5cm
        );
        tokio::spawn(yesung::handle_yesung_onoff(db, gate_seq, onoff_3cm, onoff_5cm));
      }
      WaterRecvCmd::YesungAnalogEvt(gate_seq, level) => {
        log::info!("receive yesung water analog gate_seq {} level {}", gate_seq, level);
        tokio::spawn(yesung::handle_yesung_analog(db, gate_seq, level));
      }
      WaterRecvCmd::GrpCommStat(water_seq, comm_stat) => {
        log::info!("receive water grp comm stat water_seq {} comm_stat {}", water_seq, comm_stat);
        tokio::spawn(grp_stat::handle_grp_stat(db, water_seq));
      }
      WaterRecvCmd::GrpWaterStat(water_seq, water_stat) => {
        log::info!(
          "receive water grp water stat water_seq {} water_stat {}",
          water_seq,
          water_stat
        );
        tokio::spawn(grp_stat::handle_grp_stat(db, water_seq));
      }
      WaterRecvCmd::GrpAction(water_grp_id, grp_action) => {
        log::info!(
          "receive water grp action water_grp_id {} grp_action {}",
          water_grp_id,
          grp_action
        );
        tokio::spawn(grp_action::handle_grp_action(db, water_grp_id, grp_action));
      }
    }
  }
}

struct Ctx {
  tx: Option<Sender<WaterRecvCmd>>,
}

lazy_static! {
  static ref CTX: Arc<Mutex<Ctx>> = Arc::from(Mutex::from(Ctx { tx: None }));
}

pub async fn send(cmd: WaterRecvCmd) {
  let ctx = CTX.lock().await;
  if let Some(tx) = ctx.tx.as_ref() {
    tx.send(cmd).await.unwrap();
  }
}
