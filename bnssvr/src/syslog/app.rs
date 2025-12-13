use crate::{
  svc::comm::svc_log,
  syslog::{txlog, Syslog},
};
use sea_orm::DbConn;

pub async fn init(db: DbConn) {
  let (tx_log, rx_log) = tokio::sync::mpsc::channel::<Syslog>(50);
  txlog::init(tx_log).await;
  tokio::spawn(syslog_main(db, rx_log));
}

async fn spawn_do_syslog(db: DbConn, syslog: Syslog) {
  match svc_log::mtn::Mtn::insert(&db, syslog).await {
    Ok(_) => {}
    Err(e) => {
      log::error!("[SYSLOG] syslog insert error: {}", e);
    }
  }
}

pub async fn syslog_main(db: DbConn, mut rx_log: tokio::sync::mpsc::Receiver<Syslog>) {
  loop {
    tokio::select! {
      cmd = rx_log.recv() => {
        match cmd  {
          Some(cmd) =>{
            log::info!("[SYSLOG] cmd is {cmd:?}");
            tokio::spawn(spawn_do_syslog(db.clone(), cmd));
          },
          None => {
            log::error!("[SYSLOG] cmd is None");
            break;
          }
        }
      }
    }
  }
}
