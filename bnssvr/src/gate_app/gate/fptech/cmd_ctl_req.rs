#![allow(dead_code)]

use bitflags::bitflags;

const CTL_REQ_DATA_LEN: usize = 7;
pub const CTL_REQ_PKT_LEN: usize = CTL_REQ_DATA_LEN + 5; // stx, esc, cmd, checksum, etx.

pub struct CmdCtlReq {
  pub byte1: u8,
  pub byte2: u8,
  pub byte3: u8,
  pub byte4: u8,
  pub gate: u8,
  pub byte6: u8,
  pub byte7: u8,
}

impl CmdCtlReq {
  pub fn new0() -> Self {
    Self {
      byte1: 0x00,
      byte2: 0x00,
      byte3: 0x00,
      byte4: 0x00,
      gate: 0x00,
      byte6: 0x00,
      byte7: 0x00,
    }
  }

  pub fn to_bytes(&self) -> Vec<u8> {
    let mut bytes = vec![];
    bytes.push(self.byte1);
    bytes.push(self.byte2);
    bytes.push(self.byte3);
    bytes.push(self.byte4);
    bytes.push(self.gate);
    bytes.push(self.byte6);
    bytes.push(self.byte7);
    bytes
  }

  pub fn set_uplock(&mut self) {
    self.gate |= CmdCtlReqGate::uplock.bits();
  }

  pub fn set_uplock_clear(&mut self) {
    self.gate |= CmdCtlReqGate::uplock_clear.bits();
  }

  pub fn set_down(&mut self) {
    self.gate |= CmdCtlReqGate::down.bits();
  }

  pub fn from_bytes(bytes: &[u8]) -> anyhow::Result<Self> {
    if bytes.len() != CTL_REQ_DATA_LEN {
      return Err(anyhow::anyhow!("Invalid length"));
    }

    Ok(Self {
      byte1: bytes[0],
      byte2: bytes[1],
      byte3: bytes[2],
      byte4: bytes[3],
      gate: bytes[4],
      byte6: bytes[5],
      byte7: bytes[6],
    })
  }
}

bitflags! {
    #[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
    pub struct CmdCtlReqRelay:u8{
        const relay1_off = 0b0000_0001;
        const relay1_on = 0b0000_0010;
        const relay2_off = 0b0000_0100;
        const relay2_on = 0b0000_1000;
        const relay3_on = 0b0001_0000;
        const relay3_off = 0b0010_0000;
    }


    #[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
    pub struct CmdCtlReqGate:u8{
        const uplock = 0b0000_0001;
        const uplock_clear = 0b0000_0010;
        const downlock = 0b0000_0100;
        const downlock_clear = 0b0000_1000;
        const up = 0b0001_0000;
        const down = 0b0010_0000;
    }

}
