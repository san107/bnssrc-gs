use crate::entities::tb_gate;
use crate::gate_app::util::{send_cmd_res, send_cmd_res_all, send_cmd_res_changed};
use crate::gate_app::GateCmd;
use crate::models::cd::{DoGateCmdRslt, GateCmdRsltType, GateCmdType, GateStatus};
use crate::{fln, sock, GateCtx};

mod cmder;
pub mod mgr;
mod pkt;

pub async fn do_cmd(ctx: GateCtx, model: tb_gate::Model, cmd: GateCmd) -> anyhow::Result<DoGateCmdRslt> {
  // 소켓으로 전송하고 나서, 이 결과를 처리할 것.

  // let seq = model.gate_seq;

  let cmdmsg = cmd.msg.clone().unwrap_or("".to_owned());

  // let addr = format!("{}:{}", model.gate_ip, model.gate_port).parse().unwrap();
  // debug!("[ITSON]addr is {addr:?} seq is {seq}{cmdmsg}");

  // let socket = match TcpSocket::new_v4() {
  //   Ok(s) => s,
  //   Err(e) => {
  //     let msg = format!("[ITSON]소켓 생성실패 {e:?}{cmdmsg}");
  //     let stat = GateStatus::Na;
  //     let rslt = GateCmdRsltType::Fail;
  //     send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
  //     return Err(anyhow::Error::new(e).context(fln!(msg)));
  //   }
  // };
  // debug!("[ITSON]before connect seq is {seq}{cmdmsg}");

  // let mut stream = match tokio::time::timeout(tokio::time::Duration::from_millis(5000), socket.connect(addr)).await {
  //   Ok(r) => match r {
  //     Ok(s) => s,
  //     Err(e) => {
  //       let msg = format!("[ITSON]소켓 연결실패 {e:?}{cmdmsg}");
  //       let rslt = GateCmdRsltType::Fail;
  //       let stat = GateStatus::Na;
  //       send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
  //       return Err(anyhow::Error::new(e).context(fln!(msg)));
  //     }
  //   },
  //   Err(e) => {
  //     let msg = format!("[ITSON]소켓 연결실패 timeout {e:?}{cmdmsg}");
  //     let rslt = GateCmdRsltType::Fail;
  //     let stat = GateStatus::Na;
  //     send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
  //     return Err(anyhow::Error::new(e).context(fln!(msg)));
  //   }
  // };

  let stream = sock::conn::connect(&model.gate_ip, model.gate_port).await;
  let mut stream = match stream {
    Ok(s) => s,
    Err(e) => {
      let msg = format!("[ITSON]소켓 연결실패 {e:?}{cmdmsg}");
      let rslt = GateCmdRsltType::Fail;
      let stat = GateStatus::Na;
      if cmd.cmd_type == GateCmdType::Stat {
        send_cmd_res_changed(&ctx, &model, &cmd, rslt, stat, msg.clone()).await;
      } else {
        send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
      }
      return Err(anyhow::Error::new(e).context(fln!(msg)));
    }
  };

  //crate::util::sleep(100).await; // 연결 후, 0.1초 delay.
  cmder::do_cmd(&ctx, &model, &mut stream, &cmd).await
}
