use crate::ebrd::{cmds, pkt::pkt, pktsock};
use crate::ebrd_app::model::EbrdWebRoomDelAll;
use crate::entities::tb_ebrd;
use crate::svc::ebrd::svc_ebrd;
use crate::{ebrd_app, sock};
use sea_orm::DbConn;
use tokio::sync::broadcast;

async fn do_webcmd_send(
  db: DbConn,
  cmdinfo: &mut EbrdWebRoomDelAll,
) -> Result<(Option<tb_ebrd::Model>, Option<cmds::cmd_err::CmdErr>), (String, Option<tb_ebrd::Model>)> {
  let model = svc_ebrd::qry::Qry::find_by_id(&db, cmdinfo.ebrd_seq, &cmdinfo.grp_id)
    .await
    .map_err(|e| (format!("find_by_id error: {:?}", e), None))?
    .ok_or_else(|| (format!("ebrd_seq not found"), None))?;

  if model.ebrd_id.len() != 12 {
    return Err((format!("ebrd_id length is not 12 {:?}", model.ebrd_id), Some(model)));
  }

  log::info!("{} {} {} {}", model.ebrd_nm, model.ebrd_seq, model.ebrd_ip, model.ebrd_port);

  let mut stream = sock::conn::connect(&model.ebrd_ip, model.ebrd_port)
    .await
    .map_err(|e| (format!("connect error: {:?}", e), Some(model.clone())))?;

  // PKT 패킷 생성.
  let mut pkt = pkt::Pkt::new();
  pkt.cmd = pkt::Cmd::RoomDelAll;
  pkt.id = model.ebrd_id.clone();

  let rslt = pktsock::send_pkt(&mut stream, &pkt)
    .await
    .map_err(|e| (format!("send_pkt error: {:?}", e), Some(model.clone())))?;
  log::info!("rstl : {:?}", rslt);

  let pkt = pktsock::recv_pkt(&mut stream)
    .await
    .map_err(|e| (format!("recv_pkt error: {:?}", e), Some(model.clone())))?;
  log::info!("recv_pkt : {:?}", pkt);

  if pkt.cmd == pkt::Cmd::ErrorRes {
    let cmd = cmds::cmd_err::CmdErr::from_bytes(&pkt.data);
    if cmd.is_err() {
      return Err((format!("cmd_err error: {:?}", cmd.err().unwrap()), Some(model)));
    }
    let cmd = cmd.unwrap();
    log::error!("cmd : {:?}", cmd);
    return Ok((Some(model), Some(cmd)));
  }

  Ok((Some(model), None))
}

pub async fn do_webcmd(db: DbConn, cmd: &mut EbrdWebRoomDelAll, tx_ws: broadcast::Sender<Box<String>>) -> Result<(), ()> {
  log::info!("EbrdWebRoomDelAll: {}", cmd.ebrd_seq);
  let tx = cmd.tx.take().unwrap();
  let rslt = do_webcmd_send(db.clone(), cmd).await;
  if rslt.is_err() {
    let (msg, model) = rslt.err().unwrap();
    log::error!("ebrd cmd room del all error: {}", msg);

    // 상태 변경이 필요한 경우, 상태변경 처리할 것.
    let model = model.ok_or_else(|| ())?; // unwrap 을 하기보다 None 인 경우, 무시하도록.

    let _ = ebrd_app::update_ebrd_stat(&db, &tx_ws, &model, "Err", &None, &msg).await;

    let _ = tx.send(Err(msg.clone()));
  } else {
    let (model, cmd_err) = rslt.ok().unwrap();
    if model.is_none() {
      let msg = "ebrd cmd room del all error: model is none ";
      log::error!("{}", msg);
      let _ = tx.send(Err(msg.to_string()));
      return Ok(());
    }
    let model = model.unwrap();

    let _ = ebrd_app::update_ebrd_stat(&db, &tx_ws, &model, "Ok", &cmd_err, "").await;

    if cmd_err.is_some() {
      let _ = tx.send(Err(format!("{:?}", cmd_err.unwrap())));
    } else {
      let _ = tx.send(Ok(()));
    }
  }

  Ok(())
}
