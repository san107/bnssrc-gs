use std::net::ToSocketAddrs;

use bnssvr::errf;
use tokio_modbus::{client::Context, prelude::*};

use crate::eanyhowf;

pub async fn connect(ip: &str, port: i32) -> anyhow::Result<Context> {
  let straddr = format!("{}:{}", ip, port);

  let addr = straddr.to_socket_addrs();
  if let Err(e) = addr {
    return Err(errf!(e, "소켓 생성실패 : {straddr}"));
  }
  let addr = addr.unwrap();
  let addr = addr.filter(|ele| if ele.is_ipv4() { true } else { false }).next();
  if addr.is_none() {
    return Err(eanyhowf!("소켓 주소 없음 : {straddr}"));
  }

  let addr = addr.unwrap();

  let modbus = match tokio::time::timeout(tokio::time::Duration::from_millis(5000), tcp::connect_slave(addr, Slave(1))).await {
    Ok(r) => match r {
      Ok(s) => s,
      Err(e) => {
        return Err(errf!(e, "소켓 연결실패 : {straddr}"));
      }
    },
    Err(e) => {
      return Err(errf!(e, "소켓 연결실패 timeout : {straddr} "));
    }
  };

  Ok(modbus)
}
