use bitflags::bitflags;

use crate::models::cd::GateStatus;

// 프로토콜상에 1 로 되어 있으나, 실제로는 0 으로 처리해야 값이 들어옴.( 0 base)
pub const BASE_ADDR: u16 = 1 - 1;
// BASE_ADDR 의 경우, 상태를 나타내고, BASE_ADDR + 1의 경우, 제어(명령)을 나타낸다.

#[allow(dead_code)]
pub const ADDR_ONOFF_STAT: u16 = 14222 - 1;
// #[allow(dead_code)]
// pub const ADDR_ONOFF_CTRL: u16 = 11 - 1;

#[allow(dead_code)]
pub const ADDR_WATER_LEVEL: u16 = 14204 - 1;
// #[allow(dead_code)]
// pub const ADDR_DOWN_LEVEL_SET: u16 = 14208 - 1;
// #[allow(dead_code)]
// pub const ADDR_WATER_LVL_ADJST: u16 = 14212 - 1;

pub const ADDR_HEARTBEAT: u16 = 14201 - 1;

bitflags! {
    #[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
    pub struct HpsysCrtnRead:u16{
        const remote_local = 0b0000_0001; // 0 : 현장, 1 : 관리동(원격)
        const crtn_up = 0b0000_0010; // 1 : 정상. (커튼접기) => up.
        const crtn_down = 0b0000_0100; // 1 : 정상. (커튼펼침) => down.
        const crtn_doing = 0b0000_1000; // 1 : 정상. (커튼동작중) => doing.

        const down = 0b0001_0000; // 1 : 정상. (커튼접기) => moving.
        const up = 0b0010_0000;
        const doing = 0b0100_0000;
        const fault = 0b1000_0000;

        const comm_err = 0b0000_0001_0000_0000;
    }

    pub struct HpsysCrtnWrite:u16 {
        const crtn_up = 0b0000_0001; // 접기. => 열기.
        const crtn_down = 0b0000_0010; // 펼침 => 닫침.
        const crtn_stop = 0b0000_0100;
        const down = 0b0000_1000;
        const up = 0b0001_0000;
        const stop = 0b0010_0000;
        const reset = 0b0100_0000;
    }

    pub struct HpsysCrtnOnoffStat:u16{
      const onoff_stat1 = 0b0000_0001; // 연동상태.
      const onoff_stat2 = 0b0000_0010; // 참수상태.
    }

    // pub struct HpsysCrtnOnoffCtrl:u16{
    //   const auto_down_on = 0b0000_0001; // 연동설정
    //   const auto_down_off = 0b0000_0010; // 연동정지 설정.
    // }
}

/*
 - 문 닫힘, 커튼펼침 : 열림상태.
 - 문 열림, 커튼닫힘 : 닫힘상태.

*/
#[allow(dead_code)]
pub fn get_hpsys_crtn_stat(data: u16) -> GateStatus {
  let data = HpsysCrtnRead::from_bits_truncate(data);
  if data.contains(HpsysCrtnRead::crtn_up) && data.contains(HpsysCrtnRead::down) {
    return GateStatus::UpOk;
  } else if data.contains(HpsysCrtnRead::crtn_down) && data.contains(HpsysCrtnRead::up) {
    return GateStatus::DownOk;
  } else if data.contains(HpsysCrtnRead::crtn_doing) || data.contains(HpsysCrtnRead::doing) {
    return GateStatus::Moving;
  } else if data.contains(HpsysCrtnRead::fault) || data.contains(HpsysCrtnRead::comm_err) {
    return GateStatus::Fault;
  }
  GateStatus::Na
}

pub fn get_hpsys_crtn_is_remote(data: u16) -> bool {
  let data = HpsysCrtnRead::from_bits_truncate(data);
  data.contains(HpsysCrtnRead::remote_local)
}

pub fn get_hpsys_crtn_onoff1_is_on(data: u16) -> bool {
  let data = HpsysCrtnOnoffStat::from_bits_truncate(data);
  data.contains(HpsysCrtnOnoffStat::onoff_stat1)
}

pub fn get_hpsys_crtn_onoff2_is_on(data: u16) -> bool {
  let data = HpsysCrtnOnoffStat::from_bits_truncate(data);
  data.contains(HpsysCrtnOnoffStat::onoff_stat2)
}

#[allow(dead_code)]
pub fn get_hpsys_crtn_down_cmd() -> u16 {
  //return HpsysCrtnWrite::crtn_down.bits() | HpsysCrtnWrite::down.bits();
  return HpsysCrtnWrite::crtn_down.bits();
}

#[allow(dead_code)]
pub fn get_hpsys_crtn_stop_cmd() -> u16 {
  //return HpsysCrtnWrite::crtn_down.bits() | HpsysCrtnWrite::down.bits();
  //return HpsysCrtnWrite::stop.bits();
  return HpsysCrtnWrite::crtn_stop.bits();
}

#[allow(dead_code)]
pub fn get_hpsys_crtn_up_cmd() -> u16 {
  // 열림
  //return HpsysCrtnWrite::crtn_up.bits() | HpsysCrtnWrite::up.bits();
  return HpsysCrtnWrite::crtn_up.bits();
}

pub fn get_hpsys_crtn_stat_str(data: u16) -> String {
  let mut stats: Vec<String> = vec![];
  let data = HpsysCrtnRead::from_bits_truncate(data);

  stats.push(format!(
    "Remote:{}",
    if data.contains(HpsysCrtnRead::remote_local) {
      "On"
    } else {
      "Off"
    }
  ));
  stats.push(format!(
    "CrtnUp:{}",
    if data.contains(HpsysCrtnRead::crtn_up) { "On" } else { "Off" }
  ));
  stats.push(format!(
    "CrtnDoing:{}",
    if data.contains(HpsysCrtnRead::crtn_doing) {
      "On"
    } else {
      "Off"
    }
  ));
  stats.push(format!(
    "CrtnDown:{}",
    if data.contains(HpsysCrtnRead::crtn_down) {
      "On"
    } else {
      "Off"
    }
  ));
  stats.push(format!(
    "Down:{}",
    if data.contains(HpsysCrtnRead::down) { "On" } else { "Off" }
  ));
  stats.push(format!("Up:{}", if data.contains(HpsysCrtnRead::up) { "On" } else { "Off" }));
  stats.push(format!(
    "Doing:{}",
    if data.contains(HpsysCrtnRead::doing) { "On" } else { "Off" }
  ));

  stats.push(format!(
    "Fault:{}",
    if data.contains(HpsysCrtnRead::fault) { "On" } else { "Off" }
  ));
  stats.join(",")
}

#[allow(dead_code)]
pub fn parse(data: u16) -> Vec<String> {
  let mut stats: Vec<String> = vec![];
  let data = HpsysCrtnRead::from_bits_truncate(data);

  if data.contains(HpsysCrtnRead::remote_local) {
    stats.push("Remote".to_owned());
  }
  if data.contains(HpsysCrtnRead::doing) {
    stats.push("Doing".to_owned());
  }
  if data.contains(HpsysCrtnRead::crtn_doing) {
    stats.push("CrtnDoing".to_owned());
  }
  if data.contains(HpsysCrtnRead::crtn_down) {
    stats.push("CrtnDown".to_owned());
  }
  if data.contains(HpsysCrtnRead::fault) {
    stats.push("Error".to_owned());
  }
  if data.contains(HpsysCrtnRead::down) {
    stats.push("Down".to_owned());
  }
  if data.contains(HpsysCrtnRead::up) {
    stats.push("Up".to_owned());
  }
  if data.contains(HpsysCrtnRead::crtn_up) {
    stats.push("CrtnUp".to_owned());
  }

  stats
}
