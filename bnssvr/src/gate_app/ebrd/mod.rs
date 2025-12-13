use crate::{
  ebrd::ebrd_util,
  svc::{comm::svc_file, ebrd::svc_ebrd_msg},
};
use crate::{
  ebrd_app::{app::send_ebrd_cmd, model::EbrdWebRoomInfo},
  entities::tb_ebrd,
  svc::{ebrd::svc_ebrd_map_msg, gate::svc_gate_ebrd},
  GateCtx,
};
use tokio::sync::oneshot;

async fn send_ebrd_msg(ctx: &GateCtx, ebrd: &tb_ebrd::Model) -> Result<(), String> {
  // 1. 비상메시지 설정이 되어 있는지 확인.
  let pos = ebrd.ebrd_emer_msg_pos.ok_or("비상메시지 설정이 되어 있지 않습니다.")?;

  let mut msg = svc_ebrd_map_msg::qry::Qry::find_msg_by_id(&ctx.conn, ebrd.ebrd_seq, pos)
    .await
    .map_err(|e| format!("비상메시지 조회 실패 ({e:?})"))?
    .ok_or("비상메시지 조회 실패 - None")?;

  // 2. 비상메시지에 대해서 송출중인지 확인.
  // let is_running = ebrd_util::is_msg_running(&msg)?;
  let now = ebrd_util::get_now_naive_dt();
  let start_dt = ebrd_util::add_minute_to_naive_dt(&now, -1);
  let end_dt = ebrd_util::add_day_to_naive_dt(&now, 1);
  msg.start_dt = ebrd_util::naive_dt2yyyymmddhhmm(&start_dt);
  msg.end_dt = ebrd_util::naive_dt2yyyymmddhhmm(&end_dt);

  // msg 를 저장.
  svc_ebrd_msg::mtn::Mtn::update_msg(&ctx.conn, &msg)
    .await
    .map_err(|e| format!("비상메시지 저장 실패 ({e:?})"))?;

  let file = svc_file::qry::Qry::find_by_id(&ctx.conn, msg.file_seq)
    .await
    .map_err(|e| format!("파일 조회 실패 ({e:?})"))?
    .ok_or("파일 조회 실패 - None")?;

  let cmd = ebrd_util::conv_ebrd_msg2room_info(pos, &msg, file.file_size);

  // 3. 송출중이 아닌 경우, 송출되도록 저장.
  // 지금부터 하루동안 송출되도록 지정함.

  //4. 전광판에 방정보 전송하여 송출.
  let (tx, rx) = oneshot::channel::<Result<(), String>>();

  let webcmd = EbrdWebRoomInfo {
    ebrd_seq: ebrd.ebrd_seq,
    grp_id: ebrd.grp_id.clone(),
    user_id: "[DEMON]".to_string(),
    cmd,
    tx: Some(tx),
  };

  send_ebrd_cmd(Box::new(webcmd)).await;

  rx.await.map_err(|e| format!("ebrd 메시지 전송 실패 {e:?}"))?
}

// autodown 이벤트 루프에서 처리하는게 맞을 듯.
pub async fn do_autodown_ebrd(ctx: &GateCtx, gate_seq: i32) -> Result<(), String> {
  let ebrds = svc_gate_ebrd::qry::Qry::find_ebrd_by_gate_seq(&ctx.conn, gate_seq)
    .await
    .map_err(|e| format!("ebrd 조회 실패 {e:?}"))?;
  // ebrd 를 돌면서, 비상메시지 전송.
  // 우선 현재 전송되고 있는 메시지를 확인할 것.
  for ebrd in ebrds {
    if let Err(e) = send_ebrd_msg(ctx, &ebrd).await {
      log::error!("[AUTODOWN] ebrd 메시지 전송 실패 {ebrd:?} {e:?}");
    }
  }
  Ok(())
}
