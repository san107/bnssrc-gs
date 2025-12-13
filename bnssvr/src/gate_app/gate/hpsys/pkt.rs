use bitflags::bitflags;

use crate::models::cd::GateStatus;

// 프로토콜상에 14251 로 되어 있으나, 실제로는 14250 으로 처리해야 값이 들어옴.
pub const BASE_ADDR: u16 = 14250;
//pub const BASE_ADDR: u16 = 14251;

pub const ADDR_HEARTBEAT: u16 = 14201 - 1;

bitflags! {
    #[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
    pub struct HpsysRead:u16{
        const remote_local = 0b0000_0001;
        const up = 0b0000_0010;
        const doing = 0b0000_0100;
        const down = 0b0000_1000;
        const moving = 0b0001_0000;
        const side = 0b0010_0000;
        const center = 0b0100_0000;
        const fault = 0b1000_0000;
    }

    pub struct HpsysWrite:u16 {
        const up = 0b0000_0001;
        const down = 0b0000_0010;
        const stop = 0b0000_0100;
        const reset = 0b0000_1000;
        const side = 0b0001_0000;
        const center = 0b0010_0000;
    }
}

#[allow(dead_code)]
pub fn get_hpsys_stat(data: u16) -> GateStatus {
  let data = HpsysRead::from_bits_truncate(data);
  if data.contains(HpsysRead::up) {
    return GateStatus::UpOk;
  } else if data.contains(HpsysRead::down) {
    return GateStatus::DownOk;
  } else if data.contains(HpsysRead::moving) {
    return GateStatus::Moving;
  } else if data.contains(HpsysRead::doing) {
    return GateStatus::Moving;
  } else if data.contains(HpsysRead::fault) {
    return GateStatus::Fault;
  }
  GateStatus::Na
}

pub fn get_hpsys_is_remote(data: u16) -> bool {
  let data = HpsysRead::from_bits_truncate(data);
  data.contains(HpsysRead::remote_local)
}

#[allow(dead_code)]
pub fn get_hpsys_down_cmd() -> u16 {
  return HpsysWrite::down.bits();
}

pub fn get_hpsys_clear_cmd() -> Vec<u16> {
  vec![0]
}

#[allow(dead_code)]
pub fn get_hpsys_up_cmd() -> u16 {
  return HpsysWrite::up.bits();
}

pub fn get_hpsys_side_cmd() -> u16 {
  return HpsysWrite::side.bits();
}

pub fn get_hpsys_center_cmd() -> u16 {
  return HpsysWrite::center.bits();
}

pub fn get_hpsys_stop_cmd() -> u16 {
  return HpsysWrite::stop.bits();
}

/*
        const remote_local = 0b0000_0001;
        const up = 0b0000_0010;
        const doing = 0b0000_0100;
        const down = 0b0000_1000;
        const moving = 0b0001_0000;
        const side = 0b0010_0000;
        const center = 0b0100_0000;
        const fault = 0b1000_0000;
*/
pub fn get_hpsys_stat_str(data: u16) -> String {
  let mut stats: Vec<String> = vec![];
  let data = HpsysRead::from_bits_truncate(data);

  stats.push(format!(
    "Remote:{}",
    if data.contains(HpsysRead::remote_local) { "On" } else { "Off" }
  ));
  stats.push(format!("Up:{}", if data.contains(HpsysRead::up) { "On" } else { "Off" }));
  stats.push(format!(
    "Doing:{}",
    if data.contains(HpsysRead::doing) { "On" } else { "Off" }
  ));
  stats.push(format!("Down:{}", if data.contains(HpsysRead::down) { "On" } else { "Off" }));
  stats.push(format!(
    "Moving:{}",
    if data.contains(HpsysRead::moving) { "On" } else { "Off" }
  ));
  stats.push(format!("Side:{}", if data.contains(HpsysRead::side) { "On" } else { "Off" }));
  stats.push(format!(
    "Center:{}",
    if data.contains(HpsysRead::center) { "On" } else { "Off" }
  ));

  stats.push(format!(
    "Fault:{}",
    if data.contains(HpsysRead::fault) { "On" } else { "Off" }
  ));
  stats.join(",")
}

#[allow(dead_code)]
pub fn parse(data: u16) -> Vec<String> {
  let mut stats: Vec<String> = vec![];
  let data = HpsysRead::from_bits_truncate(data);

  if data.contains(HpsysRead::remote_local) {
    stats.push("Remote".to_owned());
  }
  if data.contains(HpsysRead::center) {
    stats.push("Center".to_owned());
  }
  if data.contains(HpsysRead::doing) {
    stats.push("Doing".to_owned());
  }
  if data.contains(HpsysRead::down) {
    stats.push("Down".to_owned());
  }
  if data.contains(HpsysRead::fault) {
    stats.push("Fault".to_owned());
  }
  if data.contains(HpsysRead::moving) {
    stats.push("Moving".to_owned());
  }
  if data.contains(HpsysRead::side) {
    stats.push("Side".to_owned());
  }
  if data.contains(HpsysRead::up) {
    stats.push("Up".to_owned());
  }

  stats
}
