use super::pkt::pkt::{Cmd, CtlChar, Pkt};
use crate::sock::{recv, send};
use std::convert::TryFrom;
use thiserror::Error;
use tokio::net::TcpStream;
/**
 * 패킷 송수신 함수 모음
 */

/*
통신 신전문
| 종류   | 길이 | 신   | 데이터유형 | 내용(신)                          |
| ------ | ---- | ---- | ---------- | --------------------------------- |
| STX    | 1    | 1    | hex        | 0x02                              |
| LEN    | 2    | 3    | hex        | CMD ~ 체크섬까지 길이             |
| CMD    | 1    | 4    | hex        | 명령어 코드번호                   |
| ID     | 12   | 16   | char       | 모뎀번호                          |
| DATA   | N    | 16+N | char       | 데이터                            |
| 체크섬 | 1    | 17+N | hex        | LEN에서 ID까지의 합 중 LOW 1 byte |
| ETX    | 1    | 18*N | hex        | 0x03                              |
*/

#[allow(dead_code)]
#[derive(Error, Debug)]
pub enum SendPktErr {
  #[error("Id Length Error(expect 12) : {0}")]
  IdLenErr(usize),
  #[error("Send Error {0}")]
  SendErr(String),
}

fn get_pkt_buf(pkt: &Pkt) -> Result<Vec<u8>, SendPktErr> {
  let id = pkt.id.as_bytes();
  if id.len() != 12 {
    return Err(SendPktErr::IdLenErr(id.len()));
  }
  let len = 14 + pkt.data.len() as u16;

  let pktlen = (len + 4) as usize;
  let mut buf = vec![0; pktlen];
  buf[0] = pkt.stx.as_u8();
  buf[1] = ((len >> 8) & 0xff) as u8;
  buf[2] = (len & 0xff) as u8;
  buf[3] = pkt.cmd.as_u8();
  buf[4..16].copy_from_slice(pkt.id.as_bytes());
  buf[16..(pktlen - 2)].copy_from_slice(&pkt.data);
  // 체크섬 계산하여 저장할 것.
  let mut checksum: u32 = 0;
  for b in buf[1..(pktlen - 2)].iter() {
    checksum = checksum.wrapping_add(*b as u32);
  }
  buf[(pktlen - 2) as usize] = (checksum & 0xff) as u8;
  buf[(pktlen - 1) as usize] = pkt.etx.as_u8(); // 마지막.

  Ok(buf)
}

pub async fn send_pkt(stream: &mut TcpStream, pkt: &Pkt) -> Result<(), SendPktErr> {
  let buf = get_pkt_buf(pkt)?;
  if *crate::gconf::LOG_EBRD_PKT_SEND {
    log::info!("send_pkt pkt : {:?} buf : {:?}", pkt, buf);
  }

  send::send(stream, &buf)
    .await
    .map_err(|e| SendPktErr::SendErr(e.to_string()))?;
  Ok(())
}

#[allow(dead_code)]
#[derive(Error, Debug)]
pub enum RecvPktErr {
  #[error("Not STX Error: {0}")]
  STXErr(u8),
  #[error("Recv Error {0}")]
  RecvErr(String),
  #[error("Checksum Error: calc {0} recv {1}")]
  ChecksumErr(u8, u8),
  #[error("ETX Error: {0}")]
  ETXErr(u8),
  #[error("Len Error: {0}")]
  LenErr(u16),
  #[error("Cmd Error: {0}")]
  CmdErr(u8),
  #[error("Id Error: {0}")]
  IdErr(String),
}

fn parse_pkt(buf: &[u8], len: u16) -> Result<Pkt, RecvPktErr> {
  let mut pkt = Pkt::new();
  pkt.stx = CtlChar::try_from(buf[0]).map_err(|_| RecvPktErr::STXErr(buf[0]))?;
  pkt.len = len;
  let pktlen = (len + 4) as usize;
  if len < 14 {
    log::error!("parse_pkt LenErr {:?} {}", buf, len);
    return Err(RecvPktErr::LenErr(len));
  }

  let mut checksum: u32 = 0;
  for b in buf[1..(pktlen - 2) as usize].iter() {
    checksum = checksum.wrapping_add(*b as u32);
  }
  let checksum: u8 = (checksum & 0xff) as u8;
  if checksum != buf[pktlen - 2] {
    log::error!("parse_pkt ChecksumErr {:?} {} {} {}", buf, len, checksum, buf[pktlen - 2]);
    return Err(RecvPktErr::ChecksumErr(checksum, buf[pktlen - 2]));
  }
  pkt.checksum = checksum;
  pkt.etx = CtlChar::try_from(buf[pktlen - 1]).map_err(|_| RecvPktErr::ETXErr(buf[pktlen - 1]))?;
  pkt.cmd = Cmd::try_from(buf[3]).map_err(|_| RecvPktErr::CmdErr(buf[3]))?;
  pkt.id = String::from_utf8(buf[4..16].to_vec()).map_err(|e| RecvPktErr::IdErr(e.to_string()))?;
  pkt.data = buf[16..(pktlen - 2)].to_vec();

  if *crate::gconf::LOG_EBRD_PKT_RECV {
    log::info!("parse_pkt {:?}", pkt);
  }

  Ok(pkt)
}

pub async fn recv_pkt(stream: &mut TcpStream) -> Result<Pkt, RecvPktErr> {
  let head = recv::recv(stream, 3, *crate::gconf::EBRD_TMO_SEND).await.map_err(|e| {
    log::error!("recv_pkt head error {:?}", e);
    RecvPktErr::RecvErr(e.to_string())
  });
  if *crate::gconf::LOG_EBRD_PKT_RECV {
    log::info!("recv_pkt head {:?}", head);
  }
  if let Err(e) = head {
    log::error!("recv_pkt error {:?}", e);
    return Err(e);
  };
  let head = head.unwrap();
  // 패킷 만들어서 리턴하도록.
  let len: u16 = ((head[1] as u16) << 8) | head[2] as u16;
  if CtlChar::try_from(head[0]).map_err(|_| RecvPktErr::STXErr(head[0]))? != CtlChar::Stx {
    log::error!("recv_pkt STXErr {:?}", head);
    return Err(RecvPktErr::STXErr(head[0]));
  }
  if len < 14 {
    log::error!("recv_pkt LenErr {:?} {}", head, len);
    return Err(RecvPktErr::LenErr(len));
  }

  let body = recv::recv(stream, (len + 1) as usize, 1000 * 2)
    .await
    .map_err(|e| RecvPktErr::RecvErr(e.to_string()));
  if let Err(e) = body {
    log::error!("recv_pkt body error {:?}", e);
    return Err(e);
  };
  let body = body.unwrap();
  if *crate::gconf::LOG_EBRD_PKT_RECV {
    log::info!("recv_pkt head {:?} body {:?}", head, body);
  }

  let mut buf: Vec<u8> = vec![0; (len + 4) as usize];
  buf[0..3].copy_from_slice(&head);
  buf[3..(len + 4) as usize].copy_from_slice(&body);
  parse_pkt(&buf, len)
}

#[cfg(test)]
mod tests {
  use super::*;

  //   #[tokio::test]
  //   async fn test_send_pkt() {
  //     let buf: Vec<u8> = vec![0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  //     let buf2: Vec<u8> = vec![0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  //     let mut b: Vec<u8> = vec![0; 20];

  //     b[1..3].copy_from_slice(&buf[17..19]);

  //     println!("{:?}", b);
  //   }

  #[tokio::test]
  async fn test_recv_pkt() {
    let mut pkt = Pkt::new();
    pkt.id = "123456789012".to_string();
    pkt.data = vec![0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
    pkt.len = 14 + pkt.data.len() as u16;
    let rslt = get_pkt_buf(&pkt);
    println!("{:?}", rslt);

    let buf = rslt.unwrap();

    let pkt = parse_pkt(&buf, pkt.len).unwrap();
    println!("pkt reassing {:?}", pkt);

    for i in 1..2 {
      println!("i is {}", i);
    }
  }
}
