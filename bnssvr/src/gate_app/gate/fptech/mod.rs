use crate::{
  entities::tb_gate,
  fln, flnf,
  gate_app::{
    util::{send_cmd_res_all, send_cmd_res_changed},
    GateCmd,
  },
  models::cd::{DoGateCmdRslt, GateCmdRsltType, GateCmdType, GateStatus},
  sock, GateCtx,
};

mod cmd_ctl_req;
mod cmd_stat_info;
mod cmder;
pub mod mgr;
mod pkt;

pub async fn do_cmd(ctx: GateCtx, model: tb_gate::Model, cmd: GateCmd) -> anyhow::Result<DoGateCmdRslt> {
  // 소켓으로 전송하고 나서, 이 결과를 처리할 것.

  let seq = model.gate_seq;

  let cmdmsg = cmd.msg.clone().unwrap_or("".to_owned());

  let addr = sock::conn::connect(&model.gate_ip, model.gate_port).await;

  if let Err(e) = addr {
    let msg = flnf!("[FPTECH] 연결 에러 seq is {seq}{cmdmsg}");
    let stat = GateStatus::Na;
    let rslt = GateCmdRsltType::Fail;
    if cmd.cmd_type == GateCmdType::Stat {
      send_cmd_res_changed(&ctx, &model, &cmd, rslt, stat, msg.clone()).await;
    } else {
      send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone()).await;
    }
    return Err(anyhow::Error::new(e).context(fln!(msg)));
  }
  let mut stream = addr.unwrap();
  //crate::util::sleep(100).await; // 연결 후, 0.1초 delay.
  cmder::do_cmd(&ctx, &model, &mut stream, &cmd).await
}
