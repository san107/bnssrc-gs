use crate::{
  ebrd::{cmds::cmd_room_info::CmdRoomInfo, ebrd_util::conv_ebrd_msg2room_info},
  ebrd_app::{self, model::EbrdWebRoomInfo},
  entities::tb_login,
  svc::{
    comm::svc_file,
    ebrd::{svc_ebrd_map_msg, svc_ebrd_msg},
  },
};
use actix_session::Session;
use actix_web::{post, web, HttpResponse, Responder};
use sea_orm::DbConn;
use tokio::sync::oneshot;

pub fn regist_route(config: &mut web::ServiceConfig) {
  config.service(ctrl_room_info).service(ctrl_room_info_by_seq);
}

/*
| 명령어 | 설명                     | 내용                                  |
| ------ | ------------------------ | ------------------------------------- |
| 0x10   | ID                       | 최초접속시 전광판모뎀번호             |
| 0x03   | 시간전송                 | 시간동기화 ( 상태확인시에도 전송)     |
| 0x08   | 수신정보 이상            | 자료처리중 오류 발생알림              |
| 0x0e   | 환경감시기 동작제어      |                                       |
| 0x0e   | 환경감시기 상태요구      |                                       |
| 0x11   | 방정보 전송              | 표출할 자료의 표출설정 전송           |
| 0x13   |                          | 방정보 전송 완료                      |
| 0x14   | 방정보 삭제              | 표출목록에서 방번호의 표출정보를 삭제 |
| 0x15   | 전체 삭제                | 표출중인 메시지 전체 삭제             |
| 0xd1   | 야간시간 및 동작시간설정 | 전광판 On/Off 시간과 밝기정보 전송    |
   */

/*
pub struct CmdRoomInfo {
  pub room_no: u8,
  pub disp_effect: u8,
  pub disp_effect_speed: u8,
  pub disp_done_wait: u8,
  pub done_effect: u8,
  pub done_effect_speed: u8,
  pub disp_start_dt: String, // YYYYMMDDhhmm
  pub disp_end_dt: String,   // YYYYMMDDhhmm
  pub siren: u8,
  pub msg_type: u8,
  pub msg_seq: i32,
  pub msg_size: i32,
  pub msg_url: String,
}
*/

#[post("/api/ebrd/ctrl/room_info")]
pub async fn ctrl_room_info(sess: Session, data: web::Json<serde_json::Value>) -> impl Responder {
  let login = sess.get::<tb_login::Model>("login").unwrap().unwrap();
  log::warn!("ctrl_room_info: {:?}", data);

  let ebrd_seq = data.get("ebrd_seq").unwrap().as_i64().unwrap() as i32;
  log::info!("romm_info ebrd_seq: {:?}", ebrd_seq);

  let cmd = data.get("data").unwrap();
  log::warn!("ctrl_room_info: cmd {:?}", cmd);

  let cmd = serde_json::from_value::<CmdRoomInfo>(cmd.clone()).unwrap();
  log::warn!("ctrl_room_info: cmd_room_info {:?}", cmd);

  let (tx, rx) = oneshot::channel::<Result<(), String>>();
  // 시간정보 전송 결과값 응답 받도록 .
  let _ = ebrd_app::app::send_ebrd_cmd(Box::new(EbrdWebRoomInfo {
    user_id: login.user_id,
    ebrd_seq,
    grp_id: login.grp_id,
    cmd,
    tx: Some(tx), // 응답 받을 소켓 채널 정보.
  }))
  .await;

  let res = rx.await;
  if res.is_err() {
    return HttpResponse::InternalServerError().body(format!("InternalServerError(channel) {:?}", res.err().unwrap()));
  }
  let res = res.unwrap();
  match res {
    Ok(_ok) => HttpResponse::Ok().body("ok"),
    Err(e) => HttpResponse::InternalServerError().body(format!("InternalServerError(channel) {:?}", e)),
  }
}

async fn get_cmd_room_info(db: &DbConn, ebrd_seq: i32, pos: i32) -> Result<CmdRoomInfo, String> {
  // let rslt = svc_ebrd_map_msg::mtn::Mtn::get_by_ebrd_seq(&app.conn, ebrd_seq).await;
  // if rslt.is_err() {
  //   return Err(format!("get_cmd_room_info error {:?}", rslt.err().unwrap()));
  // }

  let map_msg = svc_ebrd_map_msg::qry::Qry::find_by_id(db, ebrd_seq, pos)
    .await
    .map_err(|e| format!("get_cmd_room_info error {:?}", e))?
    .ok_or_else(|| format!("get_cmd_room_info error {:?}", "not found"))?;

  let msg = svc_ebrd_msg::qry::Qry::find_by_id(db, map_msg.ebrd_msg_seq)
    .await
    .map_err(|e| format!("get_cmd_room_info error {:?}", e))?
    .ok_or_else(|| format!("get_cmd_room_info error {:?}", "not found"))?;

  let file = svc_file::qry::Qry::find_by_id(db, msg.file_seq)
    .await
    .map_err(|e| format!("get_cmd_room_info error {:?}", e))?
    .ok_or_else(|| format!("get_cmd_room_info error {:?}", "not found"))?;

  //let msg_url = format!("{}/api/public/file/download_nocache?fileSeq={}", baseurl, msg.file_seq);

  /*
  pub room_no: u8,
    pub disp_effect: u8,
    pub disp_effect_speed: u8,
    pub disp_done_wait: u8,
    pub done_effect: u8,
    pub done_effect_speed: u8,
    pub disp_start_dt: String, // YYYYMMDDhhmm
    pub disp_end_dt: String,   // YYYYMMDDhhmm
    pub siren: u8,
    pub msg_type: u8,
    pub msg_seq: i32,
    pub msg_size: i32,
    pub msg_url: String,
       */

  // let cmd = CmdRoomInfo {
  //   room_no: pos as u8,
  //   start_efct: msg.start_efct as u8,
  //   start_spd: msg.start_spd as u8,
  //   start_wait_time: msg.start_wait_time as u8,
  //   end_efct: msg.end_efct as u8,
  //   end_spd: msg.end_spd as u8,
  //   start_dt: msg.start_dt,
  //   end_dt: msg.end_dt,
  //   siren: if msg.sound_yn == "Y" { 0x54 } else { 0x46 }, // T: 0x54, F: 0x46
  //   msg_type: if msg.ebrd_msg_type == "Text" {
  //     1
  //   } else if msg.ebrd_msg_type == "Image" {
  //     1
  //   } else if msg.ebrd_msg_type == "Video" {
  //     2
  //   } else {
  //     0
  //   },
  //   msg_seq: msg.ebrd_msg_seq,
  //   msg_size: file.file_size,
  //   msg_url: msg_url,
  // };

  let cmd = conv_ebrd_msg2room_info(pos, &msg, file.file_size);

  Ok(cmd)
}

#[post("/api/ebrd/ctrl/room_info_by_seq")]
pub async fn ctrl_room_info_by_seq(
  sess: Session,
  app: web::Data<crate::AppState>,
  data: web::Json<serde_json::Value>,
) -> impl Responder {
  let login = sess.get::<tb_login::Model>("login").unwrap().unwrap();
  log::warn!("ctrl_room_info: {:?}", data);

  let ebrd_seq = data.get("ebrd_seq").unwrap().as_i64().unwrap() as i32;
  let ebrd_msg_pos = data.get("ebrd_msg_pos").unwrap().as_i64().unwrap() as i32;
  log::info!("romm_info ebrd_seq: {:?} ebrd_msg_pos: {:?}", ebrd_seq, ebrd_msg_pos);

  let cmd = get_cmd_room_info(&app.conn, ebrd_seq, ebrd_msg_pos).await.unwrap();

  log::warn!("ctrl_room_info: cmd {:?}", cmd);

  let (tx, rx) = oneshot::channel::<Result<(), String>>();
  // 시간정보 전송 결과값 응답 받도록 .
  let _ = ebrd_app::app::send_ebrd_cmd(Box::new(EbrdWebRoomInfo {
    user_id: login.user_id,
    ebrd_seq,
    grp_id: login.grp_id,
    cmd,
    tx: Some(tx), // 응답 받을 소켓 채널 정보.
  }))
  .await;

  let res = rx.await;
  if res.is_err() {
    return HttpResponse::InternalServerError().body(format!("InternalServerError(channel) {:?}", res.err().unwrap()));
  }
  let res = res.unwrap();
  if res.is_err() {
    let _ = svc_ebrd_map_msg::mtn::Mtn::update_send_yn(&app.conn, ebrd_seq, ebrd_msg_pos, "N", "Fail").await;
    return HttpResponse::InternalServerError().body(format!("InternalServerError(channel) {:?}", res.err().unwrap()));
  }
  // send_yn 업데이트할 것.
  let _ = svc_ebrd_map_msg::mtn::Mtn::update_send_yn(&app.conn, ebrd_seq, ebrd_msg_pos, "Y", "Success").await;

  HttpResponse::Ok().body("ok")
}
