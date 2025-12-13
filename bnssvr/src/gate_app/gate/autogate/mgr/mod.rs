use super::GateStatus;
use crate::entities::tb_gate;
use crate::gate_app::util::ws_send_gate_stat_all;
use crate::gate_app::GateCmdRsltType;
use crate::GateCtx;
use log::{debug, error};
use tokio::net::TcpSocket;

// 데몬 상태 체크.

mod cmder;

pub async fn mgr_get_status(ctx: GateCtx, model: tb_gate::Model) {
  // 상태정보 전송하도록.
  let seq = model.gate_seq;
  let addr = format!("{}:{}", model.gate_ip, model.gate_port).parse().unwrap();
  debug!("[데몬] addr is {addr:?} seq is {seq}");

  let socket = match TcpSocket::new_v4() {
    Ok(s) => s,
    Err(e) => {
      error!("[데몬] socket 생성 에러 {e:?} seq is {seq}");
      return;
    }
  };

  let mut stream = match tokio::time::timeout(tokio::time::Duration::from_millis(5000), socket.connect(addr)).await {
    Ok(r) => match r {
      Ok(s) => s,
      Err(e) => {
        let msg = format!("[데몬] 소켓 연결실패 {e:?}");
        error!("{msg}");
        let stat = GateStatus::Na;
        let rslt = GateCmdRsltType::Fail;
        if model.gate_stat == Some(stat.to_string()) && model.cmd_rslt == Some(rslt.to_string()) {
          debug!("[데몬] 이미 상태가 동일함. {stat:?} {rslt:?}");
          return;
        }
        ws_send_gate_stat_all(&ctx, model.gate_seq, stat, rslt, msg.clone()).await;
        return;
      }
    },
    Err(e) => {
      let msg = format!("[데몬] 소켓 연결실패 timeout {e:?}");
      error!("{msg}");
      let stat = GateStatus::Na;
      let rslt = GateCmdRsltType::Fail;
      if model.gate_stat == Some(stat.to_string()) && model.cmd_rslt == Some(rslt.to_string()) {
        debug!("[데몬] 이미 상태가 동일함. {stat:?} {rslt:?}");
        return;
      }
      ws_send_gate_stat_all(&ctx, model.gate_seq, stat, rslt, msg.clone()).await;
      return;
    }
  };
  //crate::util::sleep(100).await; // 연결 후, 0.1초 delay.
  cmder::mgr_get_status(&mut stream, &ctx, &model).await;
}
