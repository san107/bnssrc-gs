use bitflags::bitflags;

use crate::models::cd::{GateCmdRsltType, GateStatus};

// 모시 판정 지하차도: M0030 = 주소 30, M0031 = 주소 31
pub const BASE_READ_ADDR: u16 = 30; // M0030
pub const BASE_WRITE_ADDR: u16 = 31; // M0031

bitflags! {
    #[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
    pub struct YesungRead:u16{
        const remote_local = 0b0000_0001;  // Bit 0: 관리동/현장
        const up_complete  = 0b0000_0010;  // Bit 1: 상승완료
        const down_complete = 0b0000_0100; // Bit 2: 하강완료
        const up_doing     = 0b0000_1000;  // Bit 3: 상승 작동중
        const down_doing   = 0b0001_0000;  // Bit 4: 하강 작동중
    }

    pub struct YesungWrite:u16 {
        const up   = 0b0000_0001;  // Bit 0: PC 자동상승
        const stop = 0b0000_0010;  // Bit 1: PC 자동정지
        const down = 0b0000_0100;  // Bit 2: PC 자동하강
    }
}

#[allow(dead_code)]
pub fn get_yesung_stat(data: u16) -> (GateCmdRsltType, GateStatus) {
  let data = YesungRead::from_bits_truncate(data);

  let remote = data.contains(YesungRead::remote_local);
  let rslt = if remote {
    GateCmdRsltType::Success // 1 = 관리동 모드
  } else {
    GateCmdRsltType::ModeErr // 0 = 현장 모드
  };

  // 상승완료 확인
  if data.contains(YesungRead::up_complete) {
    return (rslt, GateStatus::UpOk);
  }
  // 하강완료 확인
  else if data.contains(YesungRead::down_complete) {
    return (rslt, GateStatus::DownOk);
  }
  // 작동중 확인
  else if data.contains(YesungRead::up_doing) || data.contains(YesungRead::down_doing) {
    return (rslt, GateStatus::Na); // 동작중 상태
  }

  (rslt, GateStatus::Na)
}

pub fn get_yesung_stat_msg(data: u16) -> String {
  let data = YesungRead::from_bits_truncate(data);

  let mut msgs = vec![];

  msgs.push(format!(
    "Remote:{}",
    match data.contains(YesungRead::remote_local) {
      true => "On(관리동)",
      false => "Off(현장)",
    }
  ));

  msgs.push(format!(
    "UpComplete:{}",
    match data.contains(YesungRead::up_complete) {
      true => "On",
      false => "Off",
    }
  ));

  msgs.push(format!(
    "DownComplete:{}",
    match data.contains(YesungRead::down_complete) {
      true => "On",
      false => "Off",
    }
  ));

  msgs.push(format!(
    "UpDoing:{}",
    match data.contains(YesungRead::up_doing) {
      true => "On",
      false => "Off",
    }
  ));

  msgs.push(format!(
    "DownDoing:{}",
    match data.contains(YesungRead::down_doing) {
      true => "On",
      false => "Off",
    }
  ));

  msgs.join(",")
}

#[allow(dead_code)]
pub fn get_yesung_down_cmd() -> u16 {
  return YesungWrite::down.bits();
}

pub fn get_yesung_clear_cmd() -> Vec<u16> {
  vec![0]
}

#[allow(dead_code)]
pub fn get_yesung_up_cmd() -> u16 {
  return YesungWrite::up.bits();
}

pub fn get_yesung_stop_cmd() -> u16 {
  return YesungWrite::stop.bits();
}

#[allow(dead_code)]
pub fn parse(data: u16) -> Vec<String> {
  let mut stats: Vec<String> = vec![];
  let data = YesungRead::from_bits_truncate(data);

  if data.contains(YesungRead::remote_local) {
    stats.push("Remote(관리동)".to_owned());
  } else {
    stats.push("Local(현장)".to_owned());
  }

  if data.contains(YesungRead::up_complete) {
    stats.push("UpComplete".to_owned());
  }
  if data.contains(YesungRead::down_complete) {
    stats.push("DownComplete".to_owned());
  }
  if data.contains(YesungRead::up_doing) {
    stats.push("UpDoing".to_owned());
  }
  if data.contains(YesungRead::down_doing) {
    stats.push("DownDoing".to_owned());
  }

  stats
}
