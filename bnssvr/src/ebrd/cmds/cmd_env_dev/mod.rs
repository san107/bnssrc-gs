#![allow(dead_code)]

use super::Error;

struct CmdEnvDev {
  pub power1: u8,
  pub fan1: u8,
  pub fan2: u8,
  pub reserved: Vec<u8>,
}

impl CmdEnvDev {
  pub fn new0() -> Self {
    Self {
      power1: 0,
      fan1: 0,
      fan2: 0,
      reserved: vec![0; 5],
    }
  }

  pub fn to_bytes(&self) -> Vec<u8> {
    let mut bytes = vec![];
    bytes.push(self.power1);
    bytes.push(self.fan1);
    bytes.push(self.fan2);
    bytes.extend_from_slice(&self.reserved);
    bytes
  }

  pub fn from_bytes(bytes: &[u8]) -> Result<Self, Error> {
    if bytes.len() != 8 {
      return Err(Error::InvalidLength);
    }

    Ok(Self {
      power1: bytes[0],
      fan1: bytes[1],
      fan2: bytes[2],
      reserved: bytes[3..].to_vec(),
    })
  }
}
