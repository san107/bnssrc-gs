use crate::{eanyhowf, errf};
use std::net::{SocketAddr, ToSocketAddrs};
use tokio_modbus::client::Context;
use tokio_modbus::prelude::*;

use crate::err;

pub async fn do_connect_sock(straddr: &str) -> anyhow::Result<SocketAddr> {
  let addr = straddr
    .to_socket_addrs()
    .map_err(|e| errf!(e, "소켓 생성실패 : {straddr}"))?
    .filter(|ele| if ele.is_ipv4() { true } else { false })
    .next()
    .ok_or(eanyhowf!("소켓 주소 없음 : {straddr}"));

  addr
}

pub async fn do_connect_modbus(addr: SocketAddr, timeout: u64) -> anyhow::Result<Context> {
  let modbus = match tokio::time::timeout(tokio::time::Duration::from_millis(timeout), tcp::connect(addr)).await {
    Ok(r) => match r {
      Ok(s) => s,
      Err(e) => {
        return Err(err!(e, "모드버스 연결실패"));
      }
    },
    Err(e) => {
      return Err(err!(e, "모드버스 연결실패 timeout"));
    }
  };

  Ok(modbus)
}

pub async fn do_connect(straddr: &str) -> anyhow::Result<Context> {
  let addr = do_connect_sock(straddr).await?;
  let modbus = do_connect_modbus(addr, 8000).await?;
  Ok(modbus)
}

pub async fn do_read_input_registers(modbus: &mut Context, addr: u16, count: u16) -> anyhow::Result<Vec<u16>> {
  let data = modbus.read_input_registers(addr, count).await;
  if let Err(e) = data {
    return Err(err!(e, "모드버스 읽기 에러"));
  }
  let data = data.unwrap();
  if let Err(e) = data {
    return Err(err!(e, "모드버스 읽기 에러"));
  }

  Ok(data.unwrap())
}

pub async fn do_write_multiple_registers(modbus: &mut Context, addr: u16, data: &[u16]) -> anyhow::Result<()> {
  let rslt = modbus.write_multiple_registers(addr, data).await;
  if let Err(e) = rslt {
    return Err(err!(e, "모드버스 쓰기 에러"));
  }
  let rslt = rslt.unwrap();
  if let Err(e) = rslt {
    return Err(err!(e, "모드버스 쓰기 에러"));
  }

  Ok(())
}
