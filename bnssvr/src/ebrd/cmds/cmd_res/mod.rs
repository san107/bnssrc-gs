#![allow(dead_code)]
use super::Error;
use crate::ebrd::pkt::pkt::Cmd;
use byteorder::{BigEndian, ByteOrder};

struct CmdRes {
  pub cmd: Cmd,
  pub ecode: u16,
}

impl CmdRes {
  pub fn new(cmd: Cmd, ecode: u16) -> Self {
    Self { cmd, ecode }
  }

  pub fn to_bytes(&self) -> Vec<u8> {
    let mut bytes = vec![0; 3];
    bytes[0] = self.cmd as u8;
    BigEndian::write_u16(&mut bytes[1..3], self.ecode);
    bytes
  }

  pub fn from_bytes(bytes: &[u8]) -> Result<Self, Error> {
    if bytes.len() != 3 {
      return Err(Error::InvalidLength);
    }

    Ok(Self {
      cmd: Cmd::try_from(bytes[0]).map_err(|_| Error::InvalidCmd)?,
      ecode: BigEndian::read_u16(&bytes[1..3]),
    })
  }
}
