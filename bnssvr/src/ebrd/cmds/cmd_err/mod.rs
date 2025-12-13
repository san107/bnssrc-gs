use super::Error;
use byteorder::BigEndian;
use byteorder::ByteOrder;
use serde::Deserialize;
use serde::Serialize;

#[derive(Debug, Serialize, Deserialize)]
pub struct CmdErr {
  pub cmd: u8,
  pub err_code: u8,
}

#[allow(dead_code)]
impl CmdErr {
  pub fn new0() -> Self {
    Self { cmd: 0, err_code: 0 }
  }

  pub fn to_bytes(&self) -> Vec<u8> {
    let mut bytes: Vec<u8> = vec![0; 2];
    bytes[0] = self.cmd;
    bytes[1] = self.err_code;
    bytes
  }

  pub fn from_bytes(bytes: &[u8]) -> Result<Self, Error> {
    if bytes.len() != 2 {
      return Err(Error::InvalidLength);
    }

    Ok(Self {
      cmd: bytes[0],
      err_code: bytes[1],
    })
  }
}
