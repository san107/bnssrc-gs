#![allow(dead_code)]
use chrono::Datelike;
use chrono::Local;
use chrono::Timelike;

use super::Error;

#[derive(Debug)]
pub struct CmdTime {
  pub year: u8,   // 년도 00 ==> 2000년
  pub month: u8,  // 월
  pub day: u8,    // 일
  pub hour: u8,   // 시
  pub minute: u8, // 분
  pub second: u8, // 초
}

#[allow(dead_code)]
impl CmdTime {
  pub fn new0() -> Self {
    Self {
      year: 0,
      month: 0,
      day: 0,
      hour: 0,
      minute: 0,
      second: 0,
    }
  }

  pub fn to_bytes(&self) -> Vec<u8> {
    vec![self.year, self.month, self.day, self.hour, self.minute, self.second]
  }

  pub fn from_bytes(bytes: &[u8]) -> Result<Self, Error> {
    if bytes.len() != 6 {
      return Err(Error::InvalidLength);
    }

    Ok(Self {
      year: bytes[0],
      month: bytes[1],
      day: bytes[2],
      hour: bytes[3],
      minute: bytes[4],
      second: bytes[5],
    })
  }

  pub fn from_now() -> Self {
    let now = Local::now();
    Self {
      year: (now.year() - 2000) as u8,
      month: now.month() as u8,
      day: now.day() as u8,
      hour: now.hour() as u8,
      minute: now.minute() as u8,
      second: now.second() as u8,
    }
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_new0() {
    let time = CmdTime::new0();
    println!("time: {:?}", time);
  }

  #[test]
  fn test_from_now() {
    let time = CmdTime::from_now();
    println!("time: {:?}", time);
    println!("tobytes: {:?}", time.to_bytes());
    //assert_eq!(time.year, Local::now().year() as u8);
  }
}
