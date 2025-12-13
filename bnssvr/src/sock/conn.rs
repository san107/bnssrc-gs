use std::net::SocketAddr;
use thiserror::Error;
use tokio::net::{TcpSocket, TcpStream};

/*
 * 아래의 #[error] 은 출력시 {:?} 가 아니라, {} 로 출력해야 나타나는 메시지이다.
 * 이 함수는, ip/port 를 받아서 연결을 시도하고, 연결 성공시 스트림을 반환한다.
*/
#[allow(dead_code)]
#[derive(Error, Debug)]
pub enum SockErr {
  #[error("소켓 생성실패 {0}")]
  SockCreateErr(String),
  #[error("IP/PORT 에러 {0}")]
  AddrErr(String),
  #[error("TIMEOUT {0}")]
  ConnTimeout(String),
  #[error("연결 실패 {0}")]
  ConnErr(String),
}

pub async fn connect(ip: &str, port: i32) -> Result<TcpStream, SockErr> {
  let addr = format!("{}:{}", ip, port)
    .parse::<SocketAddr>()
    .map_err(|e| SockErr::AddrErr(e.to_string()))?;

  let sock = TcpSocket::new_v4().map_err(|e| SockErr::SockCreateErr(e.to_string()))?;

  // 연결 timeout 8초.
  let stream = tokio::time::timeout(
    tokio::time::Duration::from_millis(*crate::gconf::SOCK_TMO_CONN),
    sock.connect(addr),
  )
  .await
  .map_err(|e| SockErr::ConnTimeout(e.to_string()))?
  .map_err(|e| SockErr::ConnErr(e.to_string()))?;

  Ok(stream)
}

#[cfg(test)]
mod tests {
  use crate::sock::{recv, send};

  use super::*;

  #[tokio::test]
  async fn test_connect() {
    if true {
      return;
    }
    let rslt = connect("175.197.51.18", 3010).await;
    if let Err(e) = rslt {
      println!("error: {} {:?}", e, e);
      return;
    }
    println!("connect success");
    let mut stream = rslt.unwrap();
    let get = "GET /test.html HTTP/1.1\r\n\r\n".to_string();
    let buf: Vec<u8> = get.as_bytes().to_vec();
    let rslt = send::send(&mut stream, &buf).await;
    if let Err(e) = rslt {
      println!("error: {} {:?}", e, e);
      return;
    }
    println!("send success");
    let rslt = recv::recv(&mut stream, 117, 1000).await;
    if let Err(e) = rslt {
      println!("error: {} {:?}", e, e);
      return;
    }
    let buf = rslt.unwrap();
    println!("recv success {:?}", String::from_utf8(buf).unwrap());
  }
}
