use crate::{
  ebrd::{cmds, pkt::pkt, pktsock},
  ebrd_app,
  entities::tb_ebrd,
  sock,
  svc::ebrd::svc_ebrd,
};
use sea_orm::DbConn;
use tokio::sync::broadcast;

async fn do_ebrd_time_send(model: &tb_ebrd::Model) -> Result<Option<cmds::cmd_err::CmdErr>, String> {
  //
  //log::debug!("do_ebrd_stat: {:?}", model);

  log::info!("{} {} {} {}", model.ebrd_nm, model.ebrd_seq, model.ebrd_ip, model.ebrd_port);

  let mut stream = sock::conn::connect(&model.ebrd_ip, model.ebrd_port)
    .await
    .map_err(|e| format!("connect error: {:?}", e))?;

  let mut pkt = pkt::Pkt::new();
  pkt.cmd = pkt::Cmd::Time;
  pkt.id = model.ebrd_id.clone();

  let cmd = cmds::cmd_time::CmdTime::from_now();
  let bytes = cmd.to_bytes();
  pkt.data = bytes;

  let rslt = pktsock::send_pkt(&mut stream, &pkt)
    .await
    .map_err(|e| format!("send_pkt error: {:?}", e))?;
  log::info!("rstl : {:?}", rslt);

  let pkt = pktsock::recv_pkt(&mut stream)
    .await
    .map_err(|e| format!("recv_pkt error: {:?}", e))?;
  log::info!("recv_pkt : {:?}", pkt);

  if pkt.cmd == pkt::Cmd::ErrorRes {
    let cmd = cmds::cmd_err::CmdErr::from_bytes(&pkt.data);
    if cmd.is_err() {
      return Ok(None);
    }
    let cmd = cmd.unwrap();
    log::error!("cmd : {:?}", cmd);
    return Ok(Some(cmd));
  }

  Ok(None)
}

async fn do_ebrd_stat(db: DbConn, model: tb_ebrd::Model, tx_ws: broadcast::Sender<Box<String>>) -> Result<(), String> {
  let rslt = do_ebrd_time_send(&model).await;

  if rslt.is_err() {
    let msg = rslt.err().unwrap();
    log::error!("ebrd cmd time error: {}", msg);

    let _ = ebrd_app::update_ebrd_stat(&db, &tx_ws, &model, "Err", &None, &msg).await;
  } else {
    let cmd_err = rslt.unwrap();
    let _ = ebrd_app::update_ebrd_stat(&db, &tx_ws, &model, "Ok", &cmd_err, "").await;
  }

  Ok(())
}

pub async fn stat_handler(db: DbConn, tx_ws: broadcast::Sender<Box<String>>) {
  // 상태관리자.
  loop {
    tokio::time::sleep(tokio::time::Duration::from_secs(60)).await;
    //tokio::time::sleep(tokio::time::Duration::from_secs(5)).await;

    let ebrd_enable = crate::util::get_env_bool("EBRD_ENABLE", false);

    if !ebrd_enable {
      log::info!("ebrd is not enable");
      continue;
    }

    // Check status and handle any changes
    log::debug!("Checking ebrd status...");

    let list = svc_ebrd::Qry::find_all_root(&db).await;
    if list.is_err() {
      log::error!("find_all_root error: {:?}", list.err());
      continue;
    }
    let list = list.unwrap();
    for ebrd in list {
      log::info!("ebrd: {}({})", ebrd.ebrd_nm, ebrd.ebrd_seq);
      let db = db.clone();
      let tx_ws = tx_ws.clone();
      tokio::spawn(async move {
        let _ = do_ebrd_stat(db, ebrd, tx_ws).await;
      });
    }
  }
}
