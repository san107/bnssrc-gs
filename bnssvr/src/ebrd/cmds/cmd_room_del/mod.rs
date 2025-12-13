#![allow(dead_code)]

use super::Error;

pub struct CmdRoomDel {
  pub room_no: u8,
}

impl CmdRoomDel {
  pub fn new0() -> Self {
    Self { room_no: 0 }
  }

  pub fn to_bytes(&self) -> Vec<u8> {
    let mut bytes = vec![0; 1];
    bytes[0] = self.room_no;
    bytes
  }

  pub fn from_bytes(bytes: &[u8]) -> Result<Self, Error> {
    Ok(Self { room_no: bytes[0] })
  }
}
