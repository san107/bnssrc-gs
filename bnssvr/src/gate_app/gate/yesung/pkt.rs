use bitflags::bitflags;

use crate::models::cd::{GateCmdRsltType, GateStatus};

// 모시 판정 지하차도 PDF 사양
pub const BASE_READ_ADDR: u16 = 30;   // M0030: 상태 읽기
pub const BASE_WRITE_ADDR: u16 = 31;  // M0031: 제어 쓰기
pub const WATER_SENSOR_ADDR: u16 = 70; // M0070: 수위센서 (3cm, 5cm)
pub const WATER_ANALOG_ADDR: u16 = 92; // M0092: 아날로그 수위 (0-30cm)

bitflags! {
    #[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
    pub struct YesungRead:u16{
        const remote_local = 0b0000_0001;  // Bit 0: 원격/로컬 (1=원격, 0=로컬)
        const up_complete  = 0b0000_0010;  // Bit 1: 상승완료
        const down_complete = 0b0000_0100; // Bit 2: 하강완료
        const up_doing     = 0b0000_1000;  // Bit 3: 상승중
        const down_doing   = 0b0001_0000;  // Bit 4: 하강중
    }

    #[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
    pub struct YesungWrite:u16 {
        const up   = 0b0000_0001;  // Bit 0: PC 상승
        const stop = 0b0000_0010;  // Bit 1: PC 정지
        const down = 0b0000_0100;  // Bit 2: PC 하강
    }

    #[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
    pub struct YesungWaterSensor:u16 {
        const water_3cm = 0b0000_0001;  // Bit 0: 3cm 수위
        const water_5cm = 0b0000_0010;  // Bit 1: 5cm 수위
    }
}

pub fn get_yesung_stat(data: u16) -> (GateCmdRsltType, GateStatus) {
  let data = YesungRead::from_bits_truncate(data);

  let remote = data.contains(YesungRead::remote_local);
  let rslt = if remote {
    GateCmdRsltType::Success // 1 = 원격 모드
  } else {
    GateCmdRsltType::ModeErr // 0 = 로컬 모드
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
    if data.contains(YesungRead::remote_local) {
      "On(원격)"
    } else {
      "Off(로컬)"
    }
  ));

  msgs.push(format!(
    "UpComplete:{}",
    if data.contains(YesungRead::up_complete) { "On" } else { "Off" }
  ));

  msgs.push(format!(
    "DownComplete:{}",
    if data.contains(YesungRead::down_complete) { "On" } else { "Off" }
  ));

  msgs.push(format!(
    "UpDoing:{}",
    if data.contains(YesungRead::up_doing) { "On" } else { "Off" }
  ));

  msgs.push(format!(
    "DownDoing:{}",
    if data.contains(YesungRead::down_doing) { "On" } else { "Off" }
  ));

  msgs.join(",")
}

pub fn get_yesung_down_cmd() -> u16 {
  YesungWrite::down.bits()
}

pub fn get_yesung_clear_cmd() -> Vec<u16> {
  vec![0]
}

pub fn get_yesung_up_cmd() -> u16 {
  YesungWrite::up.bits()
}

pub fn get_yesung_stop_cmd() -> u16 {
  YesungWrite::stop.bits()
}

pub fn parse(data: u16) -> Vec<String> {
  let mut stats: Vec<String> = vec![];
  let data = YesungRead::from_bits_truncate(data);

  if data.contains(YesungRead::remote_local) {
    stats.push("Remote(원격)".to_owned());
  } else {
    stats.push("Local(로컬)".to_owned());
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

// 수위센서 파싱
pub fn parse_water_sensor(data: u16) -> (bool, bool) {
  let sensor = YesungWaterSensor::from_bits_truncate(data);
  let water_3cm = sensor.contains(YesungWaterSensor::water_3cm);
  let water_5cm = sensor.contains(YesungWaterSensor::water_5cm);
  (water_3cm, water_5cm)
}