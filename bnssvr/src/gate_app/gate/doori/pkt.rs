use crate::models::cd::GateStatus;
use serde::{Deserialize, Serialize};

pub fn get_doori_stat(data: &Vec<bool>) -> GateStatus {
  if data.len() < 4 {
    return GateStatus::Fault;
  }
  if data[0] {
    return GateStatus::UpOk;
  } else if data[2] {
    return GateStatus::DownOk;
  }
  return GateStatus::Na;
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, strum::Display, strum::EnumString)]
pub enum DooriWindMode {
  Def,
  Wind,
  Na,
}

pub fn get_doori_wind_mode(data: &Vec<bool>) -> DooriWindMode {
  if data.len() < 1 {
    return DooriWindMode::Na;
  }
  if data[0] {
    return DooriWindMode::Wind;
  }
  return DooriWindMode::Def;
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, strum::Display, strum::EnumString)]
pub enum DooriAutoMan {
  Auto,
  Manual,
  Na,
}

pub fn get_doori_automan(data: &Vec<bool>) -> DooriAutoMan {
  if data.len() < 4 {
    return DooriAutoMan::Na;
  }
  if data[0] {
    return DooriAutoMan::Auto;
  } else if data[1] {
    return DooriAutoMan::Manual;
  }
  return DooriAutoMan::Na;
}

pub fn get_doori_remloc(data: &Vec<bool>) -> DooriRemLoc {
  if data.len() < 4 {
    return DooriRemLoc::Na;
  }
  if data[2] {
    return DooriRemLoc::Remote;
  } else if data[3] {
    return DooriRemLoc::Local;
  }
  return DooriRemLoc::Na;
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, strum::Display, strum::EnumString)]
pub enum DooriRemLoc {
  Remote,
  Local,
  Na,
}

pub const CMD_ADDR_DOWN: u16 = 8354 - 1;
pub const CMD_ADDR_UP: u16 = 8359 - 1;
pub const CMD_ADDR_STAT: u16 = 8220 - 1;
pub const CMD_ADDR_MODE: u16 = 8673 - 1;
pub const CMD_ADDR_WIND_MODE: u16 = 10273 - 1;
