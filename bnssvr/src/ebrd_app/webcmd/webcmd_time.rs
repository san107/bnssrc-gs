use crate::ebrd::{cmds, pkt::pkt, pktsock};
use crate::ebrd_app::model::EbrdWebTime;
use crate::entities::tb_ebrd;
use crate::svc::ebrd::svc_ebrd;
use crate::{ebrd_app, sock};
use sea_orm::DbConn;
use tokio::sync::broadcast;

async fn do_webcmd_time_send(
  db: DbConn,
  cmdinfo: &mut EbrdWebTime,
  _tx_ws: broadcast::Sender<Box<String>>,
) -> Result<(Option<tb_ebrd::Model>, Option<cmds::cmd_err::CmdErr>), (String, Option<tb_ebrd::Model>)> {
  // 1. seq 를 이용하여, db에서 정보를 가져온다음.
  // 2. 라이브러리 이용하여 소켓 통신 한다음.
  // 3. 결과 받아서 화긴.
  // 4. 데이터베이스에 처리 내용 저장.
  // 5. 응답 onshot::tx 를 이용하여 응답을 전달해줌.
  // 6. 상태가 달라지면, 상태 전송할 것.

  // let model = svc_ebrd::qry::Qry::find_by_id(&db, cmdinfo.ebrd_seq, &cmdinfo.grp_id)
  //   .await
  //   .map_err(|e| format!("find_by_id error: {:?}", e))
  //   .and_then(|model| model.map_or(Err(format!("ebrd_seq not found")), |model| Ok(model)));

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

  let mut pkt = pkt::Pkt::new();
  pkt.cmd = pkt::Cmd::Time;
  pkt.id = model.ebrd_id.clone();

  let cmd = cmds::cmd_time::CmdTime::from_now();
  let bytes = cmd.to_bytes();
  pkt.data = bytes;

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

  // let mut stream = sock::conn::connect("127.0.0.1", 8080).await.unwrap();

  // let mut pkt = pkt::new();
  // pkt.cmd = pkt::Cmd::Time;
  // pkt.id = "000000000000".to_string();
  // pkt.data = vec![];
  // pkt.checksum = 0;

  // let cmd = cmds::cmd_time::CmdTime::from_now();
  // let bytes = cmd.to_bytes();
  // pkt.data = bytes;

  // let rstl = pktsock::send_pkt(&mut stream, &pkt).await;
  // println!("rstl : {:?}", rstl);

  // let wrap = send.wrap.clone();
  // let tx = send.tx.take().unwrap();

  // let rslt = do_stat_request(db.clone(), wrap.clone()).await;
  // if let Err(e) = rslt.as_ref() {
  //   let msg = format!("do_stat_request error: {:?}", e);
  //   log::error!("{}", msg);
  //   tx_send_msg(tx, Err(msg));
  //   return;
  // }

  // let rslt = do_stat_save(db, tx_ws, wrap).await;
  // if let Err(e) = rslt.as_ref() {
  //   let msg = format!("do_stat_save error: {:?}", e);
  //   log::error!("{}", msg);
  //   tx_send_msg(tx, Err(msg));
  //   return;
  // }
  // tx_send_msg(tx, Ok(()));
}

pub async fn do_webcmd_time(db: DbConn, cmd: &mut EbrdWebTime, tx_ws: broadcast::Sender<Box<String>>) -> Result<(), ()> {
  log::info!("ebrd cmd time: {}", cmd.ebrd_seq);
  let tx = cmd.tx.take().unwrap();
  let rslt = do_webcmd_time_send(db.clone(), cmd, tx_ws.clone()).await;
  if rslt.is_err() {
    let (msg, model) = rslt.err().unwrap();
    log::error!("ebrd cmd time error: {}", msg);

    // 상태 변경이 필요한 경우, 상태변경 처리할 것.
    let model = model.ok_or_else(|| ())?; // unwrap 을 하기보다 None 인 경우, 무시하도록.

    let _ = ebrd_app::update_ebrd_stat(&db, &tx_ws, &model, "Err", &None, &msg).await;

    let _ = tx.send(Err(msg.clone()));
  } else {
    let (model, cmd_err) = rslt.ok().unwrap();
    if model.is_none() {
      let msg = "ebrd cmd time error: model is none ";
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
