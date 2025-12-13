use super::app::TxCtx;
use crate::{
  emcall_app::{app::emcall_send_with_ctx, model::ItgEventErr},
  models::cd::CommStat,
  svc::emcall::svc_emcall,
};
use sea_orm::DbConn;
use std::sync::Arc;
use tokio::sync::Mutex;

async fn evt_checker(ctx: Arc<Mutex<TxCtx>>, db: DbConn) {
  loop {
    // 70 초 간격으로 .
    tokio::time::sleep(tokio::time::Duration::from_secs(70)).await;

    // tb_emcall 전체목록 뒤지기.
    let emcalls = svc_emcall::qry::Qry::find_all_root(&db).await;
    if let Err(e) = emcalls {
      log::error!("emcall find_all_root error: {}", e);
      continue;
    }
    let emcalls = emcalls.unwrap();
    for emcall in emcalls {
      log::info!("emcall: seq {} id {} ", emcall.emcall_seq, emcall.emcall_id);
      if emcall.comm_stat.as_ref() == Some(&CommStat::Err.to_string()) {
        continue;
      }
      {
        let ctx = ctx.lock().await;
        let last_evt_dt = ctx.emcall_map.get(&emcall.emcall_id);
        if last_evt_dt.is_none() {
          log::error!("ITG 이벤트 수신에러 emcall: {} not found", emcall.emcall_id);
          let cmd = ItgEventErr {
            device_id: emcall.emcall_id.clone(),
          };
          emcall_send_with_ctx(&ctx, Box::new(cmd)).await;
          continue;
        }
        let last_evt_dt = last_evt_dt.unwrap();
        let diff = last_evt_dt.elapsed();
        if diff > tokio::time::Duration::from_secs(70) {
          log::error!("ITG 이벤트 수신에러 emcall: {} not found", emcall.emcall_id);
          let cmd = ItgEventErr {
            device_id: emcall.emcall_id.clone(),
          };
          emcall_send_with_ctx(&ctx, Box::new(cmd)).await;
          continue;
        }
      }
    }
  }
}

pub fn start_evt_app(ctx: &Arc<Mutex<TxCtx>>, db: &DbConn) {
  tokio::spawn(evt_checker(ctx.clone(), db.clone()));
}
