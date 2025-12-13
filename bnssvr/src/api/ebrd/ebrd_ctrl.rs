use crate::{
  ebrd_app::{
    self,
    model::{EbrdWebRoomDel, EbrdWebRoomDelAll, EbrdWebTime},
  },
  entities::tb_login,
  svc::ebrd::svc_ebrd_map_msg,
  AppState,
};
use actix_session::Session;
use actix_web::{post, web, HttpResponse, Responder};
use tokio::sync::oneshot;

pub fn regist_route(config: &mut web::ServiceConfig) {
  config.service(ctrl_time).service(ctrl_room_del).service(ctrl_room_del_all);
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

#[post("/api/ebrd/ctrl/time")]
pub async fn ctrl_time(sess: Session, data: web::Json<serde_json::Value>) -> impl Responder {
  let login = sess.get::<tb_login::Model>("login").unwrap().unwrap();

  let ebrd_seq = data.get("ebrd_seq").unwrap().as_i64().unwrap() as i32;
  log::info!("ctrl_time ebrd_seq: {:?}", ebrd_seq);

  let (tx, rx) = oneshot::channel::<Result<(), String>>();
  // 시간정보 전송 결과값 응답 받도록 .
  let _ = ebrd_app::app::send_ebrd_cmd(Box::new(EbrdWebTime {
    user_id: login.user_id,
    ebrd_seq,
    grp_id: login.grp_id,
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

#[post("/api/ebrd/ctrl/room_del")]
pub async fn ctrl_room_del(sess: Session, app: web::Data<AppState>, data: web::Json<serde_json::Value>) -> impl Responder {
  let login = sess.get::<tb_login::Model>("login").unwrap().unwrap();

  let ebrd_seq = data.get("ebrd_seq").unwrap().as_i64().unwrap() as i32;
  let ebrd_msg_pos = data.get("ebrd_msg_pos").unwrap().as_i64().unwrap() as u8;
  log::info!("ctrl_room_del ebrd_seq: {:?}, ebrd_msg_pos: {:?}", ebrd_seq, ebrd_msg_pos);

  let (tx, rx) = oneshot::channel::<Result<(), String>>();
  let _ = ebrd_app::app::send_ebrd_cmd(Box::new(EbrdWebRoomDel {
    grp_id: login.grp_id,
    tx: Some(tx),
    user_id: login.user_id,
    ebrd_seq,
    ebrd_msg_pos,
  }))
  .await;

  let res = rx.await;
  if res.is_err() {
    return HttpResponse::InternalServerError().body(format!("InternalServerError(channel) {:?}", res.err().unwrap()));
  }
  let res = res.unwrap();
  if res.is_err() {
    return HttpResponse::InternalServerError().body(format!("InternalServerError(channel) {:?}", res.err().unwrap()));
  }
  // 긴급메시지 테이블에서 삭제.
  let rslt = svc_ebrd_map_msg::mtn::Mtn::delete(&app.conn, ebrd_seq, ebrd_msg_pos as i32).await;
  if rslt.is_err() {
    let rslt = rslt.err().unwrap();
    log::error!("ctrl_room_del delete error {:?}", rslt);
  }

  HttpResponse::Ok().body("ok")
}

#[post("/api/ebrd/ctrl/room_del_all")]
pub async fn ctrl_room_del_all(sess: Session, app: web::Data<AppState>, data: web::Json<serde_json::Value>) -> impl Responder {
  let login = sess.get::<tb_login::Model>("login").unwrap().unwrap();

  let ebrd_seq = data.get("ebrd_seq").unwrap().as_i64().unwrap() as i32;

  log::info!("ctrl_room_del_all ebrd_seq: {:?}", ebrd_seq);

  let (tx, rx) = oneshot::channel::<Result<(), String>>();
  let _ = ebrd_app::app::send_ebrd_cmd(Box::new(EbrdWebRoomDelAll {
    grp_id: login.grp_id,
    tx: Some(tx),
    user_id: login.user_id,
    ebrd_seq,
  }))
  .await;

  let res = rx.await;
  if res.is_err() {
    return HttpResponse::InternalServerError().body(format!("InternalServerError(channel) {:?}", res.err().unwrap()));
  }
  let res = res.unwrap();
  if res.is_err() {
    return HttpResponse::InternalServerError().body(format!("InternalServerError(channel) {:?}", res.err().unwrap()));
  }

  // 긴급메시지 테이블에서 삭제.
  let rslt = svc_ebrd_map_msg::mtn::Mtn::delete_all_by_ebrd_seq(&app.conn, ebrd_seq).await;
  if rslt.is_err() {
    log::error!("ctrl_room_del_all delete error {:?}", rslt.err().unwrap());
  }

  HttpResponse::Ok().body("ok")
}
