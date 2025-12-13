use crate::{
  entities::tb_ebrd,
  errf,
  ndms::ndms_app::ndms_send_ebrd_disp_msg,
  svc::ebrd::{svc_ebrd, svc_ebrd_msg},
};
use sea_orm::DbConn;
use tokio::sync::broadcast;

// 처음 100 자만 취함.
async fn get_ebrd_disp_msg(db: &DbConn, model: &tb_ebrd::Model) -> anyhow::Result<String> {
  let is_emer = model.ebrd_event.as_deref() == Some("EMER_START");

  let list = if is_emer {
    svc_ebrd_msg::qry::Qry::find_emerlist(&db, model.ebrd_seq).await
  } else {
    svc_ebrd_msg::qry::Qry::find_notemerlist(&db, model.ebrd_seq).await
  }
  .map_err(|e| errf!(e, "find error"))?;

  let msg = list
    .iter()
    .map(|item| match item.ebrd_msg_type.as_str() {
      "Text" => item.ebrd_msg_text.clone(),
      "Image" => "Image".to_owned(),
      "Video" => "Video".to_owned(),
      _ => "".to_owned(),
    })
    .collect::<Vec<String>>()
    .join("\n");
  let msg = if is_emer {
    msg
  } else {
    if model.ebrd_weather_msg.is_none() || model.ebrd_weather_msg.as_ref().unwrap().is_empty() {
      msg
    } else {
      model.ebrd_weather_msg.clone().unwrap() + "\n" + &msg
    }
  };

  Ok(msg.chars().take(100).collect::<String>())
}

async fn do_ebrd_msg(db: DbConn, model: tb_ebrd::Model, _tx_ws: broadcast::Sender<Box<String>>) -> anyhow::Result<()> {
  //   let rslt = do_ebrd_time_send(&model).await;

  let msg = get_ebrd_disp_msg(&db, &model).await?;

  if Some(&msg) == model.ebrd_disp_msg.as_ref() {
    // 표출메시지가 같은 경우, 아무것도 하지 않음.
    return Ok(());
  }

  // update ebrd_disp_msg.
  svc_ebrd::Mtn::update_disp_msg(&db, model.ebrd_seq, &msg).await?;

  // ndms update msg.
  ndms_send_ebrd_disp_msg(model.ebrd_seq, &msg).await;

  // 하나의 전광판에 대해서,
  // 표출 메시지를 조회하고, : 전송완료인 것만, EMER_START 이면, 긴급. 날씨정보포함.
  // 표출메시지가 다른 경우, 전송. : 긴급의 경우, 긴급메시지 100자.  아닌 경우, 방번호 순으로 100자.
  // 같은 경우 아무것도 하지 않음.

  Ok(())
}

/*
 * 주기적으로 표출메시지를 확인해야 하는 이유는, 분단위로, 종료되는 경우, 표출메시지가 달라질 수 있기 때문이다.
*/
pub async fn disp_msg_handler(db: DbConn, tx_ws: broadcast::Sender<Box<String>>) {
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

    let list = svc_ebrd::Qry::find_all_root_in_ndms(&db).await;
    if list.is_err() {
      log::error!("find_all_root error: {:?}", list.err());
      continue;
    }
    let list = list.unwrap();
    for ebrd in list {
      log::info!("전광판:(표출메시지업데이트) {}({})", ebrd.ebrd_nm, ebrd.ebrd_seq);
      let db = db.clone();
      let tx_ws = tx_ws.clone();
      tokio::spawn(async move {
        let _ = do_ebrd_msg(db, ebrd, tx_ws).await;
      });
    }
  }
}
