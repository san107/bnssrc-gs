use bitflags::bitflags;

use crate::models::cd::{GateCmdRsltType, GateStatus};

// 프로토콜상에 14251 로 되어 있으나, 실제로는 14250 으로 처리해야 값이 들어옴.
//pub const BASE_ADDR: u16 = 14250;
pub const BASE_ADDR: u16 = 0;
//pub const BASE_ADDR: u16 = 14251;

bitflags! {
    #[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
    pub struct YesungRead:u16{
        const remote_local = 0b0000_0001;
        const up = 0b0000_0010;
        const doing = 0b0000_0100;
        const down = 0b0000_1000;
        const fault = 0b0001_0000;
        const auto = 0b0010_0000;
    }

    pub struct YesungWrite:u16 {
        const up = 0b0000_0001;
        const down = 0b0000_0010;
        const stop = 0b0000_0100;
        const fault = 0b0000_1000;
        const auto = 0b0001_0000;
        const manual = 0b0010_0000;
        const reset = 0b0100_0000;
    }
}

#[allow(dead_code)]
pub fn get_yesung_stat(data: u16) -> (GateCmdRsltType, GateStatus) {
  let data = YesungRead::from_bits_truncate(data);

  let remote = data.contains(YesungRead::remote_local);
  let rslt = if remote {
    GateCmdRsltType::Success
  } else {
    GateCmdRsltType::ModeErr
  };

  if data.contains(YesungRead::up) {
    return (rslt, GateStatus::UpOk);
  } else if data.contains(YesungRead::down) {
    return (rslt, GateStatus::DownOk);
  } else if data.contains(YesungRead::fault) {
    return (rslt, GateStatus::Fault);
  }
  (rslt, GateStatus::Na)
}

pub fn get_yesung_stat_msg(data: u16) -> String {
  let data = YesungRead::from_bits_truncate(data);

  let mut msgs = vec![];

  msgs.push(format!(
    "Remote:{}",
    match data.contains(YesungRead::remote_local) {
      true => "On",
      false => "Off",
    }
  ));

  msgs.push(format!(
    "Up:{}",
    match data.contains(YesungRead::up) {
      true => "On",
      false => "Off",
    }
  ));

  msgs.push(format!(
    "Down:{}",
    match data.contains(YesungRead::down) {
      true => "On",
      false => "Off",
    }
  ));

  msgs.push(format!(
    "Doing:{}",
    match data.contains(YesungRead::doing) {
      true => "On",
      false => "Off",
    }
  ));

  msgs.push(format!(
    "Fault:{}",
    match data.contains(YesungRead::fault) {
      true => "On",
      false => "Off",
    }
  ));

  msgs.push(format!(
    "Auto:{}",
    match data.contains(YesungRead::auto) {
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
    stats.push("Remote".to_owned());
  }
  if data.contains(YesungRead::up) {
    stats.push("Up".to_owned());
  }
  if data.contains(YesungRead::doing) {
    stats.push("Doing".to_owned());
  }
  if data.contains(YesungRead::down) {
    stats.push("Down".to_owned());
  }
  if data.contains(YesungRead::fault) {
    stats.push("Error".to_owned());
  }

  stats
}
