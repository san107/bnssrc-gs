#![allow(dead_code)]
use tokio::net::TcpStream;

use crate::{eanyhowf, err, gate_app::gate::fptech::cmd_stat_info, sock};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Cmd {
  StatInfo = 0x41, // 상태정보 요청.
  CtlReq = 0x42,   // 동작제어.
  SetInfo = 0x43,  // 설정정보 요청.
  SetReq = 0x44,
  ProdInfo = 0x45,
}

impl Cmd {
  pub fn as_u8(&self) -> u8 {
    *self as u8
  }
}

impl TryFrom<u8> for Cmd {
  type Error = &'static str;

  fn try_from(value: u8) -> Result<Self, Self::Error> {
    match value {
      0x41 => Ok(Cmd::StatInfo),
      0x42 => Ok(Cmd::CtlReq),
      0x43 => Ok(Cmd::SetInfo),
      0x44 => Ok(Cmd::SetReq),
      0x45 => Ok(Cmd::ProdInfo),
      _ => Err("Invalid command value"),
    }
  }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CtlChar {
  Stx = 0x02,
  Etx = 0x03,
  Esc = 0x1b, // 통신 프로토콜 구분.
}

impl CtlChar {
  pub fn as_u8(&self) -> u8 {
    *self as u8
  }
}

impl TryFrom<u8> for CtlChar {
  type Error = &'static str;

  fn try_from(value: u8) -> Result<Self, Self::Error> {
    match value {
      0x02 => Ok(CtlChar::Stx),
      0x03 => Ok(CtlChar::Etx),
      0x1b => Ok(CtlChar::Esc),
      _ => Err("Invalid control character value"),
    }
  }
}

#[derive(Debug)]
pub struct Pkt {
  pub stx: CtlChar,
  pub esc: CtlChar,
  pub cmd: Cmd,
  pub data: Vec<u8>,
  pub checksum: u8,
  pub etx: CtlChar,
}

impl Pkt {
  pub fn new_stat() -> Self {
    Self {
      stx: CtlChar::Stx,
      esc: CtlChar::Esc,
      cmd: Cmd::StatInfo,
      data: vec![],
      checksum: 0,
      etx: CtlChar::Etx,
    }
  }

  pub fn new_ctl() -> Self {
    Self {
      stx: CtlChar::Stx,
      esc: CtlChar::Esc,
      cmd: Cmd::CtlReq,
      data: vec![],
      checksum: 0,
      etx: CtlChar::Etx,
    }
  }

  pub fn to_bytes(&self) -> Vec<u8> {
    let mut bytes = vec![];
    bytes.push(self.stx.as_u8());
    bytes.push(self.esc.as_u8());
    bytes.push(self.cmd.as_u8());
    bytes.extend_from_slice(&self.data);
    bytes.push(self.checksum);
    bytes.push(self.etx.as_u8());
    bytes
  }

  pub fn from_bytes(bytes: &[u8]) -> anyhow::Result<Self> {
    if bytes.len() < 6 {
      return Err(anyhow::anyhow!("Invalid length {}", bytes.len()));
    }
    let stx = CtlChar::try_from(bytes[0]).map_err(|e| eanyhowf!("Invalid stx {e}"))?;
    let esc = CtlChar::try_from(bytes[1]).map_err(|e| eanyhowf!("Invalid esc {e}"))?;
    let cmd = Cmd::try_from(bytes[2]).map_err(|e| eanyhowf!("Invalid cmd {e}"))?;
    let data = bytes[3..(bytes.len() - 2)].to_vec();
    let checksum = bytes[bytes.len() - 2];
    let etx = CtlChar::try_from(bytes[bytes.len() - 1]).map_err(|e| eanyhowf!("Invalid etx {e}"))?;
    Ok(Self {
      stx: stx,
      esc: esc,
      cmd: cmd,
      data: data,
      checksum: checksum,
      etx: etx,
    })
  }

  pub fn fill_checksum(&mut self) {
    self.checksum = self.calc_checksum();
  }

  pub fn calc_checksum(&self) -> u8 {
    let mut checksum: u8 = 0;
    for i in 0..self.data.len() {
      checksum ^= self.data[i];
    }
    checksum | 0x80
  }

  pub async fn recv_pkt(stream: &mut TcpStream) -> anyhow::Result<Self> {
    let rslt = sock::recv::recv(stream, 3, 5000).await;
    if let Err(e) = rslt {
      return Err(err!(e, "recv pkt head fail"));
    }
    let bytes = rslt.unwrap();
    let cmd = Cmd::try_from(bytes[2]).map_err(|e| eanyhowf!("recv pkt cmd fail {e}"))?;
    let rlen = if cmd == Cmd::StatInfo {
      cmd_stat_info::STAT_INFO_RES_PKT_LEN - 3
    } else {
      return Err(eanyhowf!("Unknown Cmd {cmd:?}"));
    };
    let rslt = sock::recv::recv(stream, rlen, 5000).await;
    if let Err(e) = rslt {
      return Err(err!(e, "recv pkt data fail"));
    }
    let data = rslt.unwrap();
    let bytes = [bytes, data].concat();
    let pkt = Self::from_bytes(&bytes);
    if let Err(e) = pkt {
      return Err(err!(e, "pkt convert fail"));
    }

    let pkt = pkt.unwrap();
    if pkt.checksum != pkt.calc_checksum() {
      return Err(eanyhowf!("checksum error {pkt:?} {}!={}", pkt.checksum, pkt.calc_checksum()));
    }

    Ok(pkt)
  }

  pub async fn send_pkt(&mut self, stream: &mut TcpStream) -> anyhow::Result<()> {
    self.fill_checksum();
    let bytes = self.to_bytes();
    sock::send::send(stream, &bytes).await?;
    Ok(())
  }
}

/*
상태정보
02 1b 45 80 80 03
*/

// 테스트 코드
#[cfg(test)]
mod tests {
  use crate::gate_app::util::vec_to_hex;

  use super::*;

  #[tokio::test]
  async fn test_checksum() {
    // 서버 시작
    let mut pkt = Pkt::new_stat();
    pkt.cmd = Cmd::StatInfo;
    pkt.data = vec![0x80];
    // pkt.checksum = 0x80 | 0x80;
    pkt.fill_checksum();

    let bytes = pkt.to_bytes();
    println!("bytes: {:?} {}", bytes, vec_to_hex(&bytes));

    println!("{} {}", (0 ^ 1) ^ 2, 1 ^ 2)
  }
}
