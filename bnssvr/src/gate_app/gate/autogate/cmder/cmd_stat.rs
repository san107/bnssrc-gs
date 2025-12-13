use super::send_cmd_res;
use crate::{
  entities::tb_gate,
  fln,
  gate_app::{util::stream_write_all, GateCmd, GateCmdRsltType},
  models::cd::DoGateCmdRslt,
  GateCtx,
};
use tokio::net::TcpStream;

pub async fn do_cmd_stat(
  ctx: &GateCtx,
  _model: &tb_gate::Model,
  stream: &mut TcpStream,
  cmd: &GateCmd,
) -> anyhow::Result<DoGateCmdRslt> {
  let sbytes: Vec<u8> = [&[02], "STATUS".as_bytes(), &[03]].concat();
  if !stream_write_all(ctx, stream, &sbytes, cmd).await {
    return Err(anyhow::anyhow!(fln!("Stream Write All Fail")));
  }
  let (res_code, res_msg) = super::recv_cmd_res(stream, 5000).await;
  if res_code != GateCmdRsltType::Success {
    return Err(anyhow::anyhow!(fln!("Sock Recv Fail")));
  }
  log::debug!("[AUTOGATE] get status {res_code} {res_msg}");
  let status = super::super::get_str_to_status(&res_msg);
  let res_msg = format!("[AUTOGATE] Stat{res_msg}");

  send_cmd_res(cmd, GateCmdRsltType::Success, status, res_msg).await;
  Ok(DoGateCmdRslt::Success)
}
