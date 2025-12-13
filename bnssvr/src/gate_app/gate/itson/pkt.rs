use crate::models::cd::{ElockStatus, GateStatus};
use log::error;
use std::num::ParseIntError;
/*
체크섬은, cmd ~ data7 에서 xor 한 값임.
| order | id    | size | code | 설명                                      |
| ----- | ----- | ---- | ---- | ----------------------------------------- |
| 0     | DLE   | 1    | 0x10 | command packet start                      |
| 1     | STX   | 1    | 0xfc |                                           |
| 2     | Cmd   | 1    | 0xXX | command code                              |
| 3     | data0 | 1    | 0xXX | Gate 동작                                 |
| 4     | data1 | 1    | 0xXX | LED상태                                   |
| 5     | data2 | 1    | 0xXX | 경광등 상태                               |
| 6     | data3 | 1    | 0xXX | 음성출력상태                              |
| 7     | data4 | 1    | 0xXX | 사람감지                                  |
| 8     | data5 | 1    | 0xXX | 정기정 상태                               |
| 9     | data6 | 1    | 0xXX | reserve #1                                |
| 10    | data7 | 1    | 0xXX | reserve #2                                |
| 11    | CHK   | 1    | 0xXX | checksum8 xor = xor( cmd + data0 ~ data7) |
| 12    | DLE   | 1    | 0x10 |                                           |
| 13    | ETX   | 1    | 0xee | command packet end                        |
*/

#[allow(dead_code)]
#[repr(usize)]
enum PktPos {
  DLE1 = 0,
  STX = 1,
  Cmd = 2,
  DATA0 = 3,
  DATA1 = 4,
  DATA2 = 5,
  DATA3 = 6,
  DATA4 = 7,
  DATA5 = 8,
  DATA6 = 9,
  DATA7 = 10,
  CHK = 11,
  DLE2 = 12,
  ETX = 13,
}

#[allow(dead_code)]
#[repr(u8)]
enum ItsonCmd {
  GateControl = 0xc1,
  GateStatusReq = 0xc3,
  GateStatusInfo = 0xc5,
  GateAck = 0xa0,
  GateNack = 0xaf,
  DLE = 0x10,
  STX = 0xfc,
  ETX = 0xee,
}

#[allow(dead_code)]
enum ItsonGateCmd {
  Open = 1,
  Close = 3,
  Emergency = 5,
  Unknown = 0,
}

#[allow(dead_code)]
pub const PKT_LEN: usize = 14;

// 11 index자리가 체크섬임.
#[allow(dead_code)]
fn fill_cmd_checksum(v: &mut [u8]) {
  //   if v.len() < PKT_LEN {
  //     return;
  //   }
  let mut chk: u8 = 0;
  for e in &v[2..11] {
    chk = chk ^ e;
  }
  v[11] = chk;
}

#[allow(dead_code)]
fn get_cmd_checksum(v: &[u8]) -> u8 {
  let mut chk: u8 = 0;
  for e in &v[2..11] {
    chk = chk ^ e;
  }
  return chk;
}

#[allow(dead_code)]
fn get_vec_from_str(s: &str) -> Result<Vec<u8>, ParseIntError> {
  let a: Result<Vec<u8>, ParseIntError> = s.split(" ").map(|e| u8::from_str_radix(e, 16)).collect();
  return a;
}

// 로그에서 array 만드는 코드.
// ",".join([ "0x" + x for x in "10 FC C1 01 00 00 00 00 00 00 00 C0 10 EE".split(" ")])
// ",".join([ "0x" + x for x in "".split(" ")])

#[allow(dead_code)]
pub fn get_cmd_close() -> Vec<u8> {
  get_vec_from_str("10 FC C1 03 00 00 00 00 00 00 00 C2 10 EE").unwrap()
}

#[allow(dead_code)]
pub fn get_cmd_open() -> Vec<u8> {
  get_vec_from_str("10 FC C1 01 00 00 00 00 00 00 00 C0 10 EE").unwrap()
}

#[allow(dead_code)]
pub fn get_cmd_status() -> Vec<u8> {
  get_vec_from_str("10 FC C3 00 00 00 00 00 00 00 00 C3 10 EE").unwrap()
}

#[allow(dead_code)]
pub fn get_cmd_stop() -> Vec<u8> {
  let mut cmd = get_vec_from_str("10 FC C1 05 00 00 00 00 00 00 00 C2 10 EE").unwrap();
  let c = get_cmd_checksum(cmd.as_slice());
  cmd[11] = c;

  cmd
}

#[allow(dead_code)]
pub fn get_cmd_elock() -> Vec<u8> {
  //                                       0  1  2  3  4  5  6  7  8  9  10 11 12 13
  let mut cmd = get_vec_from_str("10 FC C1 00 00 00 00 00 08 00 00 C2 10 EE").unwrap();
  let c = get_cmd_checksum(cmd.as_slice());
  cmd[11] = c;
  cmd
}

#[allow(dead_code)]
pub fn get_cmd_eunlock() -> Vec<u8> {
  //                                       0  1  2  3  4  5  6  7  8  9  10 11 12 13
  let mut cmd = get_vec_from_str("10 FC C1 00 00 00 00 00 07 00 00 C2 10 EE").unwrap();
  let c = get_cmd_checksum(cmd.as_slice());
  cmd[11] = c;
  cmd
}

#[allow(dead_code)]
pub fn is_cmd_checksum_ok(a: &[u8]) -> bool {
  let c1 = a[11];
  let c2 = get_cmd_checksum(a);
  c1 == c2
}

#[allow(dead_code)]
pub fn is_cmd_ack(a: &[u8]) -> bool {
  if a.len() != PKT_LEN {
    error!("is_cmd_ack: pkt len is {}", a.len());
    return false; // 둘중하나 고른다면, nack 으로 처리하는게 맞을듯.
  }
  let c1 = a[11];
  let c2 = get_cmd_checksum(a);
  if c1 != c2 {
    return false;
  }
  if a[PktPos::Cmd as usize] == ItsonCmd::GateAck as u8 {
    true
  } else {
    false
  }
}

#[allow(dead_code)]
pub fn is_cmd_nack(a: &[u8]) -> bool {
  if a.len() != PKT_LEN {
    error!("is_cmd_nack: pkt len is {}", a.len());
    return true; // 둘중하나 고른다면, nack 으로 처리하는게 맞을듯.
  }
  let c1 = a[11];
  let c2 = get_cmd_checksum(a);
  if c1 != c2 {
    return false;
  }
  if a[PktPos::Cmd as usize] == ItsonCmd::GateNack as u8 {
    true
  } else {
    false
  }
}

pub fn get_gate_status(stat: u8) -> GateStatus {
  let status = if stat == 0x01 {
    GateStatus::UpOk // 열림.
  } else if stat == 0x03 {
    GateStatus::DownOk // 닫힘
  } else if stat == 0x05 {
    GateStatus::Stop
  } else {
    GateStatus::Na
  };
  status
}
pub fn get_elock_status(stat: u8) -> ElockStatus {
  let status = if stat == 0x07 {
    ElockStatus::UnLock // 열림.
  } else if stat == 0x08 {
    ElockStatus::Lock
  } else {
    ElockStatus::Na
  };
  status
}
