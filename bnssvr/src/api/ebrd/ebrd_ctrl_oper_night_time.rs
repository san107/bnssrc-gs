use crate::{
  ebrd::cmds::cmd_oper_night_time::CmdOperNightTime,
  ebrd_app::{self, model::EbrdWebOperNightTime},
  entities::tb_login,
  svc::ebrd::svc_ebrd,
};
use actix_session::Session;
use actix_web::{post, web, HttpResponse, Responder};
use sea_orm::DbConn;
use tokio::sync::oneshot;

pub fn regist_route(config: &mut web::ServiceConfig) {
  config.service(ctrl_oper_night_time).service(ctrl_oper_night_time_by_seq);
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
pub struct CmdOperNightTime {
  pub start_hour: u8,
  pub start_minute: u8,
  pub end_hour: u8,
  pub end_minute: u8,
  pub day_biright_level: u8,
  pub night_biright_level: u8,
  pub on_hour: u8,
  pub on_minute: u8,
  pub off_hour: u8,
  pub off_minute: u8,
}
*/

#[post("/api/ebrd/ctrl/oper_night_time")]
pub async fn ctrl_oper_night_time(sess: Session, data: web::Json<serde_json::Value>) -> impl Responder {
  let login = sess.get::<tb_login::Model>("login").unwrap().unwrap();

  let ebrd_seq = data.get("ebrd_seq").unwrap().as_i64().unwrap() as i32;
  log::info!("ctrl_time ebrd_seq: {:?}", ebrd_seq);

  let cmd = data.get("data").unwrap();
  log::warn!("ctrl_oper_night_time: cmd {:?}", cmd);

  let cmd = serde_json::from_value::<CmdOperNightTime>(cmd.clone()).unwrap();
  log::warn!("ctrl_oper_night_time: cmd_oper_night_time {:?}", cmd);

  let (tx, rx) = oneshot::channel::<Result<(), String>>();
  // 시간정보 전송 결과값 응답 받도록 .
  let _ = ebrd_app::app::send_ebrd_cmd(Box::new(EbrdWebOperNightTime {
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

async fn get_cmd_oper_night_time(db: &DbConn, ebrd_seq: i32, grp_id: &str) -> Result<CmdOperNightTime, String> {
  let ebrd = svc_ebrd::qry::Qry::find_by_id(db, ebrd_seq, grp_id)
    .await
    .map_err(|e| format!("InternalServerError(get_cmd_oper_night_time) {:?}", e))?
    .ok_or_else(|| format!("InternalServerError(get_cmd_oper_night_time) not found"))?;
  // if rslt.is_err() {
  //   return Err(format!(
  //     "InternalServerError(get_cmd_oper_night_time) {:?}",
  //     rslt.err().unwrap()
  //   ));
  // }
  //let ebrd = rslt.unwrap();
  // let cmd = CmdOperNightTime {
  //   start_hour: ebrd.oper_night_time_start_hour,
  //   start_minute: ebrd.oper_night_time_start_minute,
  //   end_hour: ebrd.oper_night_time_end_hour,
  //   end_minute: ebrd.oper_night_time_end_minute,
  //   day_biright_level: ebrd.oper_night_time_day_biright_level,
  //   night_biright_level: ebrd.oper_night_time_night_biright_level,
  //   on_hour: ebrd.oper_night_time_on_hour,
  //   on_minute: ebrd.oper_night_time_on_minute,
  //   off_hour: ebrd.oper_night_time_off_hour,
  //   off_minute: ebrd.oper_night_time_off_minute,
  // };
  let mut cmd = CmdOperNightTime::new0();
  cmd.brght_day_lvl = ebrd.brght_day_lvl as u8;
  cmd.brght_night_lvl = ebrd.brght_night_lvl as u8;

  cmd.start_hour = ebrd.day_time_start[0..2].parse::<u8>().unwrap();
  cmd.start_minute = ebrd.day_time_start[2..4].parse::<u8>().unwrap();
  cmd.end_hour = ebrd.day_time_end[0..2].parse::<u8>().unwrap();
  cmd.end_minute = ebrd.day_time_end[2..4].parse::<u8>().unwrap();
  cmd.on_hour = ebrd.on_time_start[0..2].parse::<u8>().unwrap();
  cmd.on_minute = ebrd.on_time_start[2..4].parse::<u8>().unwrap();
  cmd.off_hour = ebrd.on_time_end[0..2].parse::<u8>().unwrap();
  cmd.off_minute = ebrd.on_time_end[2..4].parse::<u8>().unwrap();

  Ok(cmd)
}

#[post("/api/ebrd/ctrl/oper_night_time_by_seq")]
pub async fn ctrl_oper_night_time_by_seq(
  sess: Session,
  app: web::Data<crate::AppState>,
  data: web::Json<serde_json::Value>,
) -> impl Responder {
  let login = sess.get::<tb_login::Model>("login").unwrap().unwrap();

  let ebrd_seq = data.get("ebrd_seq").unwrap().as_i64().unwrap() as i32;
  log::info!("ctrl_time ebrd_seq: {:?}", ebrd_seq);

  let cmd = get_cmd_oper_night_time(&app.conn, ebrd_seq, &login.grp_id).await;
  if cmd.is_err() {
    return HttpResponse::InternalServerError().body(format!(
      "InternalServerError(get_cmd_oper_night_time) {:?}",
      cmd.err().unwrap()
    ));
  }

  let cmd = cmd.unwrap();
  log::warn!("ctrl_oper_night_time: cmd {:?}", cmd);

  let (tx, rx) = oneshot::channel::<Result<(), String>>();
  // 시간정보 전송 결과값 응답 받도록 .
  let _ = ebrd_app::app::send_ebrd_cmd(Box::new(EbrdWebOperNightTime {
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
    return HttpResponse::InternalServerError().body(format!("InternalServerError(channel) {:?}", res.err().unwrap()));
  }
  // send_yn 업데이트할 것.
  let _ = svc_ebrd::mtn::Mtn::update_send_yn(&app.conn, ebrd_seq, "Y").await;

  HttpResponse::Ok().body("ok")
}
