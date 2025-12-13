#![allow(dead_code)]

use super::Error;
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct CmdOperNightTime {
  pub start_hour: u8,
  pub start_minute: u8,
  pub end_hour: u8,
  pub end_minute: u8,
  pub brght_day_lvl: u8,
  pub brght_night_lvl: u8,
  pub on_hour: u8,
  pub on_minute: u8,
  pub off_hour: u8,
  pub off_minute: u8,
}

impl CmdOperNightTime {
  pub fn new0() -> Self {
    Self {
      start_hour: 0,
      start_minute: 0,
      end_hour: 0,
      end_minute: 0,
      brght_day_lvl: 0,
      brght_night_lvl: 0,
      on_hour: 0,
      on_minute: 0,
      off_hour: 0,
      off_minute: 0,
    }
  }

  pub fn to_bytes(&self) -> Vec<u8> {
    let mut bytes = vec![0; 10];
    bytes[0] = self.start_hour;
    bytes[1] = self.start_minute;
    bytes[2] = self.end_hour;
    bytes[3] = self.end_minute;
    bytes[4] = self.brght_day_lvl;
    bytes[5] = self.brght_night_lvl;
    bytes[6] = self.on_hour;
    bytes[7] = self.on_minute;
    bytes[8] = self.off_hour;
    bytes[9] = self.off_minute;

    bytes
  }

  pub fn from_bytes(bytes: &[u8]) -> Result<Self, Error> {
    Ok(Self {
      start_hour: bytes[0],
      start_minute: bytes[1],
      end_hour: bytes[2],
      end_minute: bytes[3],
      brght_day_lvl: bytes[4],
      brght_night_lvl: bytes[5],
      on_hour: bytes[6],
      on_minute: bytes[7],
      off_hour: bytes[8],
      off_minute: bytes[9],
    })
  }
}
