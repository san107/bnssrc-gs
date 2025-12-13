#![allow(dead_code)]
use byteorder::{BigEndian, ByteOrder};

use super::Error;

struct CmdEnvDevRes {
  pub power_group1: u8,
  pub power_group2: u8,
  pub power_group3: u8,
  pub power_group4: u8,
  pub fan_heater: u8,
  pub door: u8,
  pub temperature: u8,
  pub humidity: u8,
  pub brightness: u16,
}

impl CmdEnvDevRes {
  pub fn new0() -> Self {
    Self {
      power_group1: 0,
      power_group2: 0,
      power_group3: 0,
      power_group4: 0,
      fan_heater: 0,
      door: 0,
      temperature: 0,
      humidity: 0,
      brightness: 0,
    }
  }

  pub fn to_bytes(&self) -> Vec<u8> {
    let mut bytes = vec![0; 8];
    bytes[0] = self.power_group1;
    bytes[1] = self.power_group2;
    bytes[2] = self.power_group3;
    bytes[3] = self.power_group4;
    bytes[4] = self.fan_heater;
    bytes[5] = self.door;
    bytes[6] = self.temperature;
    bytes[7] = self.humidity;
    BigEndian::write_u16(&mut bytes[8..10], self.brightness);

    bytes
  }

  pub fn from_bytes(bytes: &[u8]) -> Result<Self, Error> {
    if bytes.len() != 10 {
      return Err(Error::InvalidLength);
    }

    Ok(Self {
      power_group1: bytes[0],
      power_group2: bytes[1],
      power_group3: bytes[2],
      power_group4: bytes[3],
      fan_heater: bytes[4],
      door: bytes[5],
      temperature: bytes[6],
      humidity: bytes[7],
      brightness: BigEndian::read_u16(&bytes[8..10]),
    })
  }
}
