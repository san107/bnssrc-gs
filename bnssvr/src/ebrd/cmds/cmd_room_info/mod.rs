#![allow(dead_code)]

use byteorder::{BigEndian, ByteOrder};
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct CmdRoomInfo {
  pub room_no: u8,
  pub start_efct: u8,
  pub start_spd: u8,
  pub start_wait_time: u8,
  pub end_efct: u8,
  pub end_spd: u8,
  pub start_dt: String, // YYYYMMDDhhmm
  pub end_dt: String,   // YYYYMMDDhhmm
  pub siren: u8,
  pub msg_type: u8,
  pub msg_seq: i32,
  pub msg_size: i32,
  pub msg_url: String,
}

impl CmdRoomInfo {
  pub fn new0() -> Self {
    Self {
      room_no: 0,
      start_efct: 0,
      start_spd: 0,
      start_wait_time: 0,
      end_efct: 0,
      end_spd: 0,
      start_dt: String::new(),
      end_dt: String::new(),
      siren: 0,
      msg_type: 0,
      msg_seq: 0,
      msg_size: 0,
      msg_url: String::new(),
    }
  }

  /**
   * dt : YYYYMMDDhhmm
   */
  fn string_dt_to_bytes(dt: &str) -> Vec<u8> {
    let mut bytes = vec![0; 5];

    bytes[0] = dt[2..4].parse::<u8>().unwrap();
    bytes[1] = dt[4..6].parse::<u8>().unwrap();
    bytes[2] = dt[6..8].parse::<u8>().unwrap();
    bytes[3] = dt[8..10].parse::<u8>().unwrap();
    bytes[4] = dt[10..12].parse::<u8>().unwrap();

    bytes
  }
  pub fn to_bytes(&self) -> Vec<u8> {
    let mut bytes = vec![0; 26 + self.msg_url.len()];
    bytes[0] = self.room_no;
    bytes[1] = self.start_efct;
    bytes[2] = self.start_spd;
    bytes[3] = self.start_wait_time;
    bytes[4] = self.end_efct;
    bytes[5] = self.end_spd;
    bytes[6..11].copy_from_slice(&CmdRoomInfo::string_dt_to_bytes(&self.start_dt));
    bytes[11..16].copy_from_slice(&CmdRoomInfo::string_dt_to_bytes(&self.end_dt));
    bytes[16] = self.siren;
    bytes[17] = self.msg_type;

    BigEndian::write_i32(&mut bytes[18..22], self.msg_seq);
    BigEndian::write_i32(&mut bytes[22..26], self.msg_size);
    bytes[26..26 + self.msg_url.len()].copy_from_slice(self.msg_url.as_bytes());

    bytes
  }
}
