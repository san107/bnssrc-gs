use crate::{
  entities::tb_water,
  models::cd::WaterStat,
  svc::{
    alm::{
      svc_alm_sett::{self, qry::AlmSetInfo},
      svc_alm_water,
    },
    comm::svc_sms_solapi,
    conf::svc_cd,
  },
};
use sea_orm::DbConn;
use std::{env, str::FromStr};

// 1. sms 활성화 여부 체크.
// 2. 발송조건 체크.
// 3. 기 발송하였는지 확인.
// 4. 발송목록 조회.
// 5. SMS 발송.
// 6. 발송이력 저장.

// SMS 정보 테이블.
// water_seq, water_dev_id(x), sms_stat, sms_stat_dt
// 테이블명 : tb_alm_water_info

async fn update_alm_water_stat(db: &DbConn, model: &tb_water::Model, water_stat: WaterStat) {
  let alm = svc_alm_water::qry::Qry::find_by_id(db, model.water_seq).await;
  if let Err(e) = alm {
    log::error!("DbErr {e:?}");
    return;
  }
  let alm = alm.unwrap();
  if alm.is_none() {
    _ = svc_alm_water::mtn::Mtn::save_stat(db, model.water_seq, water_stat).await;
  }
  let alm = alm.unwrap();
  let alm_stat = alm.sms_water_stat;
  if alm_stat.is_none() {
    _ = svc_alm_water::mtn::Mtn::save_stat(db, model.water_seq, water_stat).await;
  }
  let alm_stat = alm_stat.unwrap();
  if alm_stat == water_stat.to_string() {
    return;
  }
  _ = svc_alm_water::mtn::Mtn::save_stat(db, model.water_seq, water_stat).await;
}

pub async fn do_sms_water_event(db: &DbConn, model: &tb_water::Model, old_stat: &str) {
  // 1. sms 활화 여부 체크.
  let sms_enable = crate::util::get_env_bool("SMS_ENABLE", false);
  if !sms_enable {
    // 활성화 되지 않았으면, 그냥 리턴.
    log::debug!(
      "sms 활성화 되지 않았으면, 그냥 리턴. {} {}",
      model.water_dev_id,
      model.water_seq
    );
    return;
  }
  // 발송조건.
  if model.water_stat.is_none() {
    // 상태가 없으면 할 수 없음.
    log::debug!(
      "상태가 없으면 할 수 없음. {model:?} {} {}",
      model.water_dev_id,
      model.water_seq
    );
    return;
  }
  let water_stat = model.water_stat.as_ref().unwrap();
  let water_stat = WaterStat::from_str(water_stat);
  if let Err(e) = water_stat {
    log::error!("파싱에러는 나오지 않는 조건임 {e:?}");
    return;
  }
  let water_stat = water_stat.unwrap();
  let old_stat = WaterStat::from_str(old_stat).unwrap_or(WaterStat::Unknown);

  if old_stat >= water_stat {
    log::debug!(
      "이전상태가 현재상태보다 크거나 같음. {old_stat:?} >= {water_stat:?} {} {}",
      model.water_dev_id,
      model.water_seq
    );

    update_alm_water_stat(db, model, water_stat).await;
    return;
  }

  // 이하 발생조건. tb_alm_water 테이블 조회하여 없으면 알람발생시키도록.
  let water_seq = model.water_seq;
  let alm = svc_alm_water::qry::Qry::find_by_id(db, water_seq).await;
  if let Err(e) = alm {
    log::error!("DbErr {e:?}");
    return;
  }
  let alm = alm.unwrap();

  if alm.is_none() {
    do_send_alarm_with_norm_check(db, model, water_stat).await;
    return;
  }
  let alm = alm.unwrap();
  let alm_stat = alm.sms_water_stat;
  if alm_stat.is_none() {
    // 저장된 것이 없으므로, 알람발송.
    do_send_alarm_with_norm_check(db, model, water_stat).await;
    return;
  }
  let alm_stat = alm_stat.unwrap();
  let alm_stat = WaterStat::from_str(&alm_stat);
  if let Err(e) = alm_stat {
    // 파싱 오류.. 우선 알람전송 => 발생할 수 없는 케이스.
    log::error!("파싱 오류.. {e:?}");
    do_send_alarm_with_norm_check(db, model, water_stat).await;
    return;
  }
  let alm_stat = alm_stat.unwrap();
  if alm_stat == water_stat {
    // 동일상태이므로 아무것도 하지 않음.
    log::debug!("동일상태이므로 아무것도 하지 않음. {water_stat:?} {alm_stat:?}");
    return;
  }
  // if water_stat == WaterStat::Norm || water_stat == WaterStat::Unknown {
  //   _ = svc_alm_water::mtn::Mtn::save_stat(db, water_seq, water_stat).await;
  // } else {
  //   do_send_alarm(db, model).await;
  // }
  do_send_alarm_with_norm_check(db, model, water_stat).await;
}

async fn do_send_alarm_with_norm_check(db: &DbConn, model: &tb_water::Model, water_stat: WaterStat) {
  log::debug!("do_send_alarm_with_norm_check {water_stat:?}");
  if water_stat == WaterStat::Norm || water_stat == WaterStat::Unknown {
    _ = svc_alm_water::mtn::Mtn::save_stat(db, model.water_seq, water_stat).await;
  } else {
    do_send_alarm(db, model).await;
  }
}

async fn do_send_alarm(db: &DbConn, water: &tb_water::Model) {
  // 1. 알람설정 테이블 조회하여, 전송대상 확보.
  // 2. 각 전송대상의 전화 번호 확보
  // 3. 알람 메시지 구성.
  //
  let list = svc_alm_sett::qry::Qry::find_by_water(db, water.water_seq).await;
  if let Err(e) = list {
    log::error!("db 조회 에러 {e:?}");
    return;
  }
  if water.water_stat.is_none() {
    log::error!("수위계상태가 없음");
    return;
  }
  let water_stat = water.water_stat.as_ref().unwrap();
  let stat_nm = if let Ok(v) = svc_cd::qry::Qry::find_by_grp_id(db, "WS", &water_stat).await {
    if v.len() > 0 {
      v.get(0).unwrap().cd_nm.clone()
    } else {
      "".to_owned()
    }
  } else {
    "".to_owned()
  };
  if stat_nm == "" {
    log::error!("코드 조회 에러 : {water_stat}");
    return;
  }
  // 메시지 구성.
  // 수위계 {} 가 수위 {} m 로 {} 알람이 발생하였습니다.
  let msg = format!(
    "{} 가 {} 알람이 발생하였습니다.",
    water.water_nm,
    //water.water_level.unwrap_or(0f64),
    stat_nm
  );
  let water_stat = WaterStat::from_str(&water_stat);
  if let Err(e) = water_stat {
    log::error!("stat parse error {e:?}");
    return;
  }
  let water_stat = water_stat.unwrap();
  let list = list.unwrap();

  // 발신자 전화번호
  let sms_sender_phone = env::var("SMS_SENDER_PHONE").unwrap_or("01094757661".to_owned());

  for info in list {
    if !is_sett_alm_stat(&water_stat, &info) {
      log::debug!("is_sett_alm_stat false {info:?} {water_stat:?}");
      continue;
    }
    log::debug!("send_solapi_sms {info:?} {water_stat:?} {msg:?}");
    // 알람수신 설정된 경우, SMS알람 전송.
    send_solapi_sms(db, &info, &sms_sender_phone, &msg).await;
  }

  // 상태 저장.
  // tb_alm_water 테이블에, 발송한 상태를 저장함.
  _ = svc_alm_water::mtn::Mtn::save_stat(db, water.water_seq, water_stat).await;

  // // 자동차단 체크할 것.
  // autodown::autodown(db, water, water_stat).await;
}

async fn send_solapi_sms(db: &DbConn, info: &AlmSetInfo, sender_phone: &str, msg: &str) {
  //log::debug!("send_solapi_sms {info:?} {sender_phone:?} {msg:?}");
  let user_phone = &info.alm_user_mobile;
  log::warn!("SEND REAL SMS from {sender_phone} to {user_phone} msg {msg}");
  let rslt = svc_sms_solapi::mtn::Mtn::send_sms(db, sender_phone, user_phone, msg).await;
  if let Err(e) = rslt {
    log::error!("send_solapi_sms error {e:?}");
  }

  // let realsend = crate::util::get_env_bool("SMS_REALSEND", false);
  // if realsend {
  //   log::warn!("SEND REAL SMS from {sender_phone} to {user_phone} msg {msg}");
  //   let _ = svc_sms_solapi::mtn::Mtn::send_sms(db, sender_phone, user_phone, msg).await;
  // } else {
  //   log::warn!("SEND SMS from {sender_phone} to {user_phone} msg {msg}");
  // }
}

fn is_sett_alm_stat(stat: &WaterStat, info: &AlmSetInfo) -> bool {
  if *stat == WaterStat::Attn {
    return if info.sms_attn_yn == "Y" { true } else { false };
  } else if *stat == WaterStat::Warn {
    return if info.sms_warn_yn == "Y" { true } else { false };
  } else if *stat == WaterStat::Alert {
    return if info.sms_alert_yn == "Y" { true } else { false };
  } else if *stat == WaterStat::Crit {
    return if info.sms_crit_yn == "Y" { true } else { false };
  } else {
    false
  }
}
