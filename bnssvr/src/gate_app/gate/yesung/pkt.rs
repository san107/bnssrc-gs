use bitflags::bitflags;

use crate::models::cd::{GateCmdRsltType, GateStatus};

// 실제 장비 주소 - 각각 독립된 주소!
pub const READ_REMOTE_ADDR: u16 = 0; // P00: 관리/현장
pub const READ_UP_OK_ADDR: u16 = 8; // P08: 상승완료
pub const READ_DOWN_OK_ADDR: u16 = 9; // P09: 하강완료

pub const WRITE_UP_ADDR: u16 = 2; // P02: 상승제어
pub const WRITE_DOWN_ADDR: u16 = 3; // P03: 하강제어
pub const WRITE_STOP_ADDR: u16 = 4; // P04: 정지제어

pub const WATER_3CM_ADDR: u16 = 5; // P05: 수위 3cm
pub const WATER_5CM_ADDR: u16 = 6; // P06: 수위 5cm
pub const WATER_ANALOG_ADDR: u16 = 92; // M0092: 아날로그 수위 (0-30cm)

// 각 주소의 값이 0 또는 1
bitflags! {
    #[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
    pub struct YesungValue:u16{
        const on = 0b0000_0001;  // 값이 1이면 ON
    }
}

// 3개 주소를 읽어서 상태 판단
pub fn get_yesung_stat(
  remote: u16,  // P00 값
  up_ok: u16,   // P08 값
  down_ok: u16, // P09 값
) -> (GateCmdRsltType, GateStatus) {
  let rslt = if remote == 1 {
    GateCmdRsltType::Success // 관리동 모드
  } else {
    GateCmdRsltType::ModeErr // 현장 모드
  };

  if up_ok == 1 {
    return (rslt, GateStatus::UpOk);
  } else if down_ok == 1 {
    return (rslt, GateStatus::DownOk);
  }

  (rslt, GateStatus::Na)
}

pub fn get_yesung_stat_msg(remote: u16, up_ok: u16, down_ok: u16) -> String {
  let mut msgs = vec![];

  msgs.push(format!("Remote:{}", if remote == 1 { "On(관리동)" } else { "Off(현장)" }));

  msgs.push(format!("UpOk:{}", if up_ok == 1 { "On" } else { "Off" }));

  msgs.push(format!("DownOk:{}", if down_ok == 1 { "On" } else { "Off" }));

  msgs.join(",")
}

pub fn get_yesung_down_cmd() -> u16 {
  1 // P03에 1 쓰기
}

pub fn get_yesung_up_cmd() -> u16 {
  1 // P02에 1 쓰기
}

pub fn get_yesung_stop_cmd() -> u16 {
  1 // P04에 1 쓰기
}

pub fn get_yesung_clear_cmd() -> Vec<u16> {
  vec![0]
}

pub fn parse(remote: u16, up_ok: u16, down_ok: u16) -> Vec<String> {
  let mut stats: Vec<String> = vec![];

  if remote == 1 {
    stats.push("Remote(관리동)".to_owned());
  } else {
    stats.push("Local(현장)".to_owned());
  }

  if up_ok == 1 {
    stats.push("UpOk".to_owned());
  }
  if down_ok == 1 {
    stats.push("DownOk".to_owned());
  }

  stats
}
