use crate::ebrd::cmds::cmd_room_info::CmdRoomInfo;
use crate::entities::tb_ebrd_msg;
use chrono::NaiveDateTime;
use once_cell::sync::Lazy;

static BASEURL: Lazy<String> = Lazy::new(|| {
  let baseurl = crate::util::get_env_str("BNSSVR_BASE_URL", "http://localhost:8080");
  baseurl
});

pub fn get_msg_file_url(file_seq: &i32) -> String {
  format!("{}/api/public/file/download_nocache?fileSeq={}", BASEURL.as_str(), file_seq)
}

#[allow(dead_code)]
pub fn conv_ebrd_msg2room_info(pos: i32, model: &tb_ebrd_msg::Model, file_size: i32) -> CmdRoomInfo {
  CmdRoomInfo {
    room_no: pos as u8,
    start_efct: model.start_efct as u8,
    start_spd: model.start_spd as u8,
    start_wait_time: model.start_wait_time as u8,
    end_efct: model.end_efct as u8,
    end_spd: model.end_spd as u8,
    start_dt: model.start_dt.clone(),
    end_dt: model.end_dt.clone(),
    siren: if model.sound_yn == "Y" { 0x54 } else { 0x46 }, // T: 0x54, F: 0x46
    msg_type: match model.ebrd_msg_type.as_str() {
      "Text" => 1,
      "Image" => 1,
      "Video" => 2,
      _ => 0,
    },
    msg_seq: model.ebrd_msg_seq,
    msg_size: file_size,
    msg_url: get_msg_file_url(&model.file_seq),
  }
}

pub fn get_yyyymmdd2naive_dt(yyyymmddhhmm: &str) -> Result<NaiveDateTime, String> {
  NaiveDateTime::parse_from_str(yyyymmddhhmm, "%Y%m%d%H%M").map_err(|e| e.to_string())
}

#[allow(dead_code)]
pub fn is_msg_running(model: &tb_ebrd_msg::Model) -> Result<bool, String> {
  //model.start_dt <= chrono::Utc::now() && model.end_dt >= chrono::Utc::now()
  let start_dt = get_yyyymmdd2naive_dt(&model.start_dt)?;
  let end_dt = get_yyyymmdd2naive_dt(&model.end_dt)?;
  let now = chrono::Local::now().naive_local();

  Ok(start_dt <= now && now <= end_dt)
}

pub fn get_now_naive_dt() -> NaiveDateTime {
  chrono::Local::now().naive_local()
}

pub fn add_minute_to_naive_dt(dt: &NaiveDateTime, minutes: i64) -> NaiveDateTime {
  dt.checked_add_signed(chrono::Duration::minutes(minutes)).unwrap_or(*dt)
}
pub fn add_day_to_naive_dt(dt: &NaiveDateTime, days: i64) -> NaiveDateTime {
  dt.checked_add_signed(chrono::Duration::days(days)).unwrap_or(*dt)
}
pub fn naive_dt2yyyymmddhhmm(dt: &NaiveDateTime) -> String {
  dt.format("%Y%m%d%H%M").to_string()
}

#[cfg(test)]
mod tests {
  use super::*;
  use chrono::{Datelike, NaiveDateTime, Timelike};

  #[test]
  fn test_get_yyyymmdd2naive_dt() {
    let result = get_yyyymmdd2naive_dt("202312251430");
    assert!(result.is_ok());
    let dt = result.unwrap();

    assert_eq!(dt.year(), 2023);
    assert_eq!(dt.month(), 12);
    assert_eq!(dt.day(), 25);
    assert_eq!(dt.hour(), 14);
    assert_eq!(dt.minute(), 30);

    let invalid = get_yyyymmdd2naive_dt("invalid");
    assert!(invalid.is_err());
  }

  #[test]
  fn test_add_minute_to_naive_dt() {
    let dt = NaiveDateTime::parse_from_str("2023-12-25 14:30:00", "%Y-%m-%d %H:%M:%S").unwrap();

    let result = add_minute_to_naive_dt(&dt, 30);
    assert_eq!(result.hour(), 15);
    assert_eq!(result.minute(), 0);

    let result = add_minute_to_naive_dt(&dt, -30);
    assert_eq!(result.hour(), 14);
    assert_eq!(result.minute(), 0);
  }

  #[test]
  fn test_add_day_to_naive_dt() {
    let dt = NaiveDateTime::parse_from_str("2023-12-25 14:30:00", "%Y-%m-%d %H:%M:%S").unwrap();

    let result = add_day_to_naive_dt(&dt, 1);
    assert_eq!(result.day(), 26);

    let result = add_day_to_naive_dt(&dt, -1);
    assert_eq!(result.day(), 24);
  }

  #[test]
  fn test_naive_dt2yyyymmddhhmm() {
    let dt = NaiveDateTime::parse_from_str("2023-12-25 14:30:00", "%Y-%m-%d %H:%M:%S").unwrap();
    let result = naive_dt2yyyymmddhhmm(&dt);
    assert_eq!(result, "202312251430");
  }
}
