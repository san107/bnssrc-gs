use thiserror::Error;
use tokio::{io::AsyncReadExt, net::TcpStream};

#[allow(dead_code)]
#[derive(Error, Debug)]
pub enum RecvErr {
  #[error("recv timeout {0} ms : {1}, reqlen : {2} , recvlen : {3}")]
  Timeout(String, u64, usize, usize),
  #[error("recv error {0} ms : {1}, reqlen : {2} , recvlen : {3}")]
  RecvErr(String, u64, usize, usize),
  #[error("recv error(zero) {0} ms : {1}, reqlen : {2} , recvlen : {3}")]
  RecvZero(String, u64, usize, usize),
}

pub async fn recv(stream: &mut TcpStream, req_len: usize, ms: u64) -> Result<Vec<u8>, RecvErr> {
  let mut buf: Vec<u8> = vec![0; req_len];

  let mut read_len: usize = 0;
  loop {
    let s = tokio::time::timeout(tokio::time::Duration::from_millis(ms), stream.read(&mut buf[read_len..]))
      .await
      .map_err(|e| {
        log::error!("recv timeout {:?} ms:{},reqlen:{},recvlen:{}", e, ms, req_len, read_len);
        RecvErr::Timeout(e.to_string(), ms, req_len, read_len)
      })?
      .map_err(|e| {
        log::error!("recv error {:?} ms:{},reqlen:{},recvlen:{}", e, ms, req_len, read_len);
        RecvErr::RecvErr(e.to_string(), ms, req_len, read_len)
      })?;
    read_len += s;
    if s == 0 {
      log::error!("recv read 0 ms:{},reqlen:{},recvlen:{}", ms, req_len, read_len);
      return Err(RecvErr::RecvZero("read 0".to_string(), ms, req_len, read_len));
    }

    if read_len >= req_len {
      return Ok(buf);
    }
  }
}
