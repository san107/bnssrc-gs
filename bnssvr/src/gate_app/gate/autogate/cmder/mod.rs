use super::send_cmd_res;
use crate::{
  entities::tb_gate,
  fln,
  gate_app::{GateCmd, GateCmdRsltType, GateCmdType, GateStatus},
  models::cd::DoGateCmdRslt,
  GateCtx,
};
use core::str;
use log::error;
use tokio::{io::AsyncReadExt, net::TcpStream};

mod cmd_autodown;
mod cmd_down;
mod cmd_stat;
mod cmd_up;

async fn recv_cmd_res(stream: &mut TcpStream, ms: u64) -> (GateCmdRsltType, String) {
  let mut buf: [u8; 1] = [0; 1];
  let mut all: Vec<u8> = vec![];
  let mut code = GateCmdRsltType::Success;
  loop {
    match tokio::time::timeout(tokio::time::Duration::from_millis(ms), stream.read(&mut buf)).await {
      Ok(ok) => match ok {
        Ok(ok) => {
          if ok == 0 {
            log::error!("[AUTOGATE] receive size is 0");
            break;
          }
          all.append(&mut buf[0..ok].to_vec());
          if buf[ok - 1] == 3 {
            break;
          }
        }
        Err(e) => {
          error!("[AUTOGATE] read error {e:?}");
          code = GateCmdRsltType::Fail;
          break;
        }
      },
      Err(e) => {
        error!("[AUTOGATE] read timeout {e:?}");
        code = GateCmdRsltType::Fail;
        break;
      }
    }
  }
  if all.len() < 3 {
    // 02..03 - 3보다 작을 수 없음.
    error!("[AUTOGATE] all is under 3 => {}", all.len());
    return (code, "".to_owned());
  }

  match str::from_utf8(&all[1..all.len() - 1]) {
    Ok(ok) => (code, ok.to_owned()),
    Err(e) => {
      error!("[AUTOGATE] convert error {e:?}");
      (code, "Str Convert Error".to_owned())
    }
  }
}

pub async fn do_cmd(
  ctx: &GateCtx,
  model: &tb_gate::Model,
  stream: &mut TcpStream,
  cmd: &GateCmd,
) -> anyhow::Result<DoGateCmdRslt> {
  let cmdmsg = cmd.msg.clone().unwrap_or("".to_owned());
  if cmd.cmd_type == GateCmdType::Down {
    return cmd_down::do_cmd_down(ctx, model, stream, cmd).await;
  } else if cmd.cmd_type == GateCmdType::DownAsync {
    return cmd_down::do_cmd_down(ctx, model, stream, cmd).await;
  } else if cmd.cmd_type == GateCmdType::Up {
    return cmd_up::do_cmd_up(ctx, model, stream, cmd).await;
  } else if cmd.cmd_type == GateCmdType::UpAsync {
    return cmd_up::do_cmd_up(ctx, model, stream, cmd).await; // Autogate의 경우 동일함.
  } else if cmd.cmd_type == GateCmdType::Stat {
    return cmd_stat::do_cmd_stat(ctx, model, stream, cmd).await;
  } else if cmd.cmd_type == GateCmdType::AutoDown {
    return cmd_autodown::do_cmd_autodown(ctx, model, stream, cmd).await;
  }

  let msg = format!("[AUTOGATE] Not Supported Cmd {:?}{cmdmsg}", cmd.cmd_type);
  send_cmd_res(&cmd, GateCmdRsltType::Fail, GateStatus::Na, msg.clone()).await;

  Err(anyhow::anyhow!(fln!(msg)))
}
