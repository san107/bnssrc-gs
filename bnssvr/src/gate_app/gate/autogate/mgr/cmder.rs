use crate::{
  entities::tb_gate,
  gate_app::{util::ws_send_gate_stat_all, GateCmdRsltType, GateStatus},
  GateCtx,
};
use core::str;
use log::{debug, error, info};
use tokio::{
  io::{AsyncReadExt, AsyncWriteExt},
  net::TcpStream,
};

async fn recv_cmd_res(stream: &mut TcpStream, ms: u64) -> (GateCmdRsltType, String) {
  let mut buf: [u8; 1] = [0; 1];
  let mut all: Vec<u8> = vec![];
  let mut code = GateCmdRsltType::Success;

  loop {
    let ret = tokio::time::timeout(tokio::time::Duration::from_millis(ms), stream.read(&mut buf)).await;
    if let Err(e) = ret {
      error!("[데몬] read timeout {e:?} ms:{ms}");
      code = GateCmdRsltType::Fail;
      break;
    }
    let ret = ret.unwrap();
    if let Err(e) = ret {
      error!("[데몬] read error {e:?}");
      code = GateCmdRsltType::Fail;
      break;
    }
    let ok = ret.unwrap();
    if ok == 0 {
      log::error!("[데몬] receive size is 0");
      break;
    }
    all.append(&mut buf[0..ok].to_vec());
    if buf[ok - 1] == 3 {
      break;
    }
  }

  if all.len() < 3 {
    // 02..03 - 3보다 작을 수 없음.
    error!("[데몬] all is under 3 => {}", all.len());
    return (code, "".to_owned());
  }

  match str::from_utf8(&all[1..all.len() - 1]) {
    Ok(ok) => (code, ok.to_owned()),
    Err(e) => {
      error!("[데몬] convert error {e:?}");
      (code, "Str Convert Error".to_owned())
    }
  }
}

pub async fn mgr_get_status(stream: &mut TcpStream, ctx: &GateCtx, model: &tb_gate::Model) {
  let sbytes = [&[02], "STATUS".as_bytes(), &[03]].concat();
  let ret = stream.write(&sbytes).await;
  if let Err(e) = ret {
    let msg = format!("[데몬] 소켓 write 실패 {e:?}");
    error!("{msg}");
    let stat = GateStatus::Na;
    let rslt = GateCmdRsltType::Fail;
    if model.gate_stat == Some(stat.to_string()) && model.cmd_rslt == Some(rslt.to_string()) {
      debug!("[데몬] 이미 상태가 동일함. {stat:?} {rslt:?}");
      return;
    }
    ws_send_gate_stat_all(ctx, model.gate_seq, stat, rslt, msg.clone()).await;
    return;
  }
  let _ret = ret.unwrap();

  info!("[데몬] Send Status Command OK {:?}", sbytes);
  let (rslt, res) = recv_cmd_res(stream, 5000).await;
  info!("[데몬] Read Command Res {}", res);
  let stat = super::super::get_str_to_status(&res);

  if model.gate_stat == Some(stat.to_string()) && model.cmd_rslt == Some(rslt.to_string()) {
    debug!("[데몬] 이미 상태가 동일함. {stat:?} {rslt:?}");
    return;
  }
  ws_send_gate_stat_all(ctx, model.gate_seq, stat, rslt, "[데몬]".to_owned()).await;
}
