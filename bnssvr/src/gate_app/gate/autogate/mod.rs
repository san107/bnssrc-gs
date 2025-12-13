use crate::entities::tb_gate;
use crate::gate_app::util::{send_cmd_res, send_cmd_res_all};
use crate::gate_app::{GateCmd, GateCmdRsltType, GateStatus};
use crate::models::cd::DoGateCmdRslt;
use crate::{fln, GateCtx};
use log::debug;
use tokio::net::TcpSocket;

mod cmder;
pub mod mgr;

pub async fn do_cmd(ctx: GateCtx, model: tb_gate::Model, cmd: GateCmd) -> anyhow::Result<DoGateCmdRslt> {
  // 소켓으로 전송하고 나서, 이 결과를 처리할 것.

  let seq = model.gate_seq;
  let addr = format!("{}:{}", model.gate_ip, model.gate_port).parse().unwrap();
  let cmdmsg = cmd.msg.clone().unwrap_or("".to_owned());
  debug!("[AUTOGATE] addr is {addr:?} seq is {seq}{cmdmsg}");

  let socket = match TcpSocket::new_v4() {
    Ok(s) => s,
    Err(e) => {
      let msg = format!("[AUTOGATE] 소켓 생성실패 {e:?} seq is {seq}{cmdmsg}");
      let stat = GateStatus::Na;
      let rslt = GateCmdRsltType::Fail;
      send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;

      return Err(anyhow::Error::new(e).context(fln!(msg)));
    }
  };
  debug!("[AUTOGATE] before connect seq is {seq}{cmdmsg}");

  let mut stream = match tokio::time::timeout(tokio::time::Duration::from_millis(8000), socket.connect(addr)).await {
    Ok(r) => match r {
      Ok(s) => s,
      Err(e) => {
        let msg = format!("[AUTOGATE] 소켓 연결실패 {e:?}{cmdmsg}");
        let rslt = GateCmdRsltType::Fail;
        let stat = GateStatus::Na;
        send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
        return Err(anyhow::Error::new(e).context(fln!(msg)));
      }
    },
    Err(e) => {
      let msg = format!("[AUTOGATE] 소켓 연결실패 timeout {e:?}{cmdmsg}");
      let rslt = GateCmdRsltType::Fail;
      let stat = GateStatus::Na;
      send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
      return Err(anyhow::Error::new(e).context(fln!(msg)));
    }
  };

  //crate::util::sleep(100).await; // 연결 후, 0.1초 delay.
  cmder::do_cmd(&ctx, &model, &mut stream, &cmd).await
}

/**
 * status 문자열을 status 로 바꾸는 함수.
 */
pub fn get_str_to_status(res: &str) -> GateStatus {
  let statestr = res
    .split(",")
    .map(|s| s.split("=").collect::<Vec<&str>>())
    .find(|e| e[0] == "GATE" && e.len() == 2)
    .map_or_else(|| "", |v| v[1]);
  match statestr {
    "UP OK" => GateStatus::UpOk,
    "UPLOCK" => GateStatus::UpLock,
    "UP ACTION" => GateStatus::UpAction,
    "DOWN ACTION" => GateStatus::DownAction,
    "DOWN OK" => GateStatus::DownOk,
    _ => GateStatus::Na,
  }
}
