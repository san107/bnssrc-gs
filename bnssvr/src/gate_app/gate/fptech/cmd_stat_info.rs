#![allow(dead_code)]

use bitflags::bitflags;

use crate::models::cd::GateStatus;

pub struct CmdStatInfoReq {
  pub data: u8,
}

const STAT_INFO_RES_DATA_LEN: usize = 11;
pub const STAT_INFO_RES_PKT_LEN: usize = STAT_INFO_RES_DATA_LEN + 5; // stx, esc, cmd, checksum, etx.

impl CmdStatInfoReq {
  pub fn new0() -> Self {
    Self { data: 0x80 }
  }

  pub fn to_bytes(&self) -> Vec<u8> {
    let mut bytes = vec![];
    bytes.push(self.data);
    bytes
  }

  pub fn from_bytes(bytes: &[u8]) -> anyhow::Result<Self> {
    if bytes.len() != 1 {
      return Err(anyhow::anyhow!("Invalid length"));
    }

    Ok(Self { data: bytes[0] })
  }
}

pub struct CmdStatInfoRes {
  pub byte1: u8,
  pub gate1: u8,
  pub gate2: u8,
  pub gate3: u8,
  pub byte5: u8,
  pub byte6: u8,
  pub byte7: u8,
  pub byte8: u8,
  pub byte9: u8,
  pub byte10: u8,
  pub byte11: u8,
}

impl CmdStatInfoRes {
  pub fn new0() -> Self {
    Self {
      byte1: 0x00,
      gate1: 0x00,
      gate2: 0x00,
      gate3: 0x00,
      byte5: 0x00,
      byte6: 0x00,
      byte7: 0x00,
      byte8: 0x00,
      byte9: 0x00,
      byte10: 0x00,
      byte11: 0x00,
    }
  }

  pub fn to_bytes(&self) -> Vec<u8> {
    let mut bytes = vec![];
    bytes.push(self.byte1);
    bytes.push(self.gate1);
    bytes.push(self.gate2);
    bytes.push(self.gate3);
    bytes.push(self.byte5);
    bytes.push(self.byte6);
    bytes.push(self.byte7);
    bytes.push(self.byte8);
    bytes.push(self.byte9);
    bytes.push(self.byte10);
    bytes.push(self.byte11);
    bytes
  }

  pub fn from_bytes(bytes: &[u8]) -> anyhow::Result<Self> {
    if bytes.len() != STAT_INFO_RES_DATA_LEN {
      return Err(anyhow::anyhow!("Invalid length"));
    }

    Ok(Self {
      byte1: bytes[0],
      gate1: bytes[1],
      gate2: bytes[2],
      gate3: bytes[3],
      byte5: bytes[4],
      byte6: bytes[5],
      byte7: bytes[6],
      byte8: bytes[7],
      byte9: bytes[8],
      byte10: bytes[9],
      byte11: bytes[10],
    })
  }

  pub fn gate_status(&self) -> GateStatus {
    let gate1 = CmdStatInfoGate1::from_bits_truncate(self.gate1);
    let gate2 = CmdStatInfoGate2::from_bits_truncate(self.gate2);
    if gate1.contains(CmdStatInfoGate1::up_doing) {
      return GateStatus::UpAction;
    } else if gate1.contains(CmdStatInfoGate1::up_done) {
      if gate2.contains(CmdStatInfoGate2::center_up_lock) {
        return GateStatus::UpLock;
      } else if gate2.contains(CmdStatInfoGate2::local_up_lock) {
        return GateStatus::UpLock;
      }
      return GateStatus::UpOk;
    } else if gate1.contains(CmdStatInfoGate1::down_doing) {
      return GateStatus::DownAction;
    } else if gate1.contains(CmdStatInfoGate1::down_done) {
      if gate2.contains(CmdStatInfoGate2::center_down_lock) {
        return GateStatus::DownLock;
      } else if gate2.contains(CmdStatInfoGate2::local_down_lock) {
        return GateStatus::DownLock;
      }
      return GateStatus::DownOk;
    }
    GateStatus::Na
  }

  pub fn gate_status_str(&self) -> String {
    let mut msgs = vec![];
    let gate1 = CmdStatInfoGate1::from_bits_truncate(self.gate1);
    let gate2 = CmdStatInfoGate2::from_bits_truncate(self.gate2);

    msgs.push(format!(
      "UpDoing:{}",
      match gate1.contains(CmdStatInfoGate1::up_doing) {
        true => "On",
        false => "Off",
      }
    ));

    msgs.push(format!(
      "UpDone:{}",
      match gate1.contains(CmdStatInfoGate1::up_done) {
        true => "On",
        false => "Off",
      }
    ));

    msgs.push(format!(
      "DownDoing:{}",
      match gate1.contains(CmdStatInfoGate1::down_doing) {
        true => "On",
        false => "Off",
      }
    ));

    msgs.push(format!(
      "DownDone:{}",
      match gate1.contains(CmdStatInfoGate1::down_done) {
        true => "On",
        false => "Off",
      }
    ));

    msgs.push(format!(
      "ExtraUpDoing:{}",
      match gate1.contains(CmdStatInfoGate1::extra_up_doing) {
        true => "On",
        false => "Off",
      }
    ));

    msgs.push(format!(
      "CenterUpLock:{}",
      match gate2.contains(CmdStatInfoGate2::center_up_lock) {
        true => "On",
        false => "Off",
      }
    ));

    msgs.push(format!(
      "CenterDownLock:{}",
      match gate2.contains(CmdStatInfoGate2::center_down_lock) {
        true => "On",
        false => "Off",
      }
    ));

    msgs.push(format!(
      "LocalUpLock:{}",
      match gate2.contains(CmdStatInfoGate2::local_up_lock) {
        true => "On",
        false => "Off",
      }
    ));

    msgs.push(format!(
      "LocalDownLock:{}",
      match gate2.contains(CmdStatInfoGate2::local_down_lock) {
        true => "On",
        false => "Off",
      }
    ));

    msgs.join(",")
  }
}

bitflags! {
    #[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
    pub struct CmdStatInfoGate1:u8{
        const up_doing = 0b0000_0001;
        const up_done = 0b0000_0010;
        const down_doing = 0b0000_0100;
        const down_done = 0b0000_1000;
        const extra_up_doing = 0b0001_0000;
    }

    #[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
    pub struct CmdStatInfoGate2:u8{
        const center_up_lock = 0b0000_0001;
        const center_down_lock = 0b0000_0010;
        const local_up_lock = 0b0000_0100;
        const local_down_lock = 0b0000_1000;
        const bar1_status = 0b0001_0000;
        const bar2_status = 0b0010_0000;
    }

    #[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
    pub struct CmdStatInfoGate3:u8{
        const up_input = 0b0000_0001;
        const auto_up_input = 0b0000_0010;
        const aux_up_input = 0b0000_0100;
        const down_input = 0b0000_1000;
        const sensor_input = 0b0001_0000;
        const downlock_bar_input = 0b0010_0000;
    }
}

/*

bitflags! {
    #[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
    pub struct HngskRead:u16{
        const remote_local = 0b0000_0001;
        const up = 0b0000_0010;
        const doing = 0b0000_0100;
        const down = 0b0000_1000;
        const fault = 0b0001_0000;
        const auto = 0b0010_0000;
    }

    pub struct HngskWrite:u16 {
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
pub fn get_hngsk_stat(data: u16) -> (GateCmdRsltType, GateStatus) {
  let data = HngskRead::from_bits_truncate(data);

  let remote = data.contains(HngskRead::remote_local);
  let rslt = if remote {
    GateCmdRsltType::Success
  } else {
    GateCmdRsltType::ModeErr
  };

  if data.contains(HngskRead::up) {
    return (rslt, GateStatus::UpOk);
  } else if data.contains(HngskRead::down) {
    return (rslt, GateStatus::DownOk);
  } else if data.contains(HngskRead::fault) {
    return (rslt, GateStatus::Fault);
  }
  (rslt, GateStatus::Na)
}

pub fn get_hngsk_stat_msg(data: u16) -> String {
  let data = HngskRead::from_bits_truncate(data);

  let mut msgs = vec![];

  msgs.push(format!(
    "Remote:{}",
    match data.contains(HngskRead::remote_local) {
      true => "On",
      false => "Off",
    }
  ));

  msgs.push(format!(
    "Up:{}",
    match data.contains(HngskRead::up) {
      true => "On",
      false => "Off",
    }
  ));

  msgs.push(format!(
    "Down:{}",
    match data.contains(HngskRead::down) {
      true => "On",
      false => "Off",
    }
  ));

  msgs.push(format!(
    "Doing:{}",
    match data.contains(HngskRead::doing) {
      true => "On",
      false => "Off",
    }
  ));

  msgs.push(format!(
    "Fault:{}",
    match data.contains(HngskRead::fault) {
      true => "On",
      false => "Off",
    }
  ));

  msgs.push(format!(
    "Auto:{}",
    match data.contains(HngskRead::auto) {
      true => "On",
      false => "Off",
    }
  ));

  msgs.join(",")
}

#[allow(dead_code)]
pub fn get_hngsk_down_cmd() -> u16 {
  return HngskWrite::down.bits();
}

pub fn get_hngsk_clear_cmd() -> Vec<u16> {
  vec![0]
}

#[allow(dead_code)]
pub fn get_hngsk_up_cmd() -> u16 {
  return HngskWrite::up.bits();
}

pub fn get_hngsk_stop_cmd() -> u16 {
  return HngskWrite::stop.bits();
}

#[allow(dead_code)]
pub fn parse(data: u16) -> Vec<String> {
  let mut stats: Vec<String> = vec![];
  let data = HngskRead::from_bits_truncate(data);

  if data.contains(HngskRead::remote_local) {
    stats.push("Remote".to_owned());
  }
  if data.contains(HngskRead::up) {
    stats.push("Up".to_owned());
  }
  if data.contains(HngskRead::doing) {
    stats.push("Doing".to_owned());
  }
  if data.contains(HngskRead::down) {
    stats.push("Down".to_owned());
  }
  if data.contains(HngskRead::fault) {
    stats.push("Error".to_owned());
  }

  stats
}

 */
