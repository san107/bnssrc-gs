use crate::{
  entities::tb_gate,
  fln, flnf,
  gate_app::{
    doori::{
      pkt::{self, DooriWindMode},
      util::doori_send_cmd_res_all,
    },
    GateCmd,
  },
  models::cd::{DoGateCmdRslt, GateCmdRsltType, GateStatus},
  GateCtx,
};
use tokio_modbus::client::{Context, Writer};

pub async fn do_cmd_wind(
  ctx: &GateCtx,
  model: &tb_gate::Model,
  modbus: &mut Context,
  cmd: &GateCmd,
) -> anyhow::Result<DoGateCmdRslt> {
  let (rslt, stat, msg, automan, remloc, wind) = super::get_status(ctx, modbus, cmd).await;
  if let GateCmdRsltType::Fail = rslt {
    // 실패의 경우에는 안에서 처리함.
    return Err(anyhow::anyhow!(flnf!(
      "get_status fail {msg} {} {} {}",
      cmd.cmd_type,
      cmd.gate_seq,
      model.gate_nm
    )));
  } else if let GateCmdRsltType::ModeErr = rslt {
    let msg = format!("[DOORI] ModeErr {msg} {} {} {}", cmd.cmd_type, cmd.gate_seq, model.gate_nm);
    log::error!("{msg}");
    doori_send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone(), automan, remloc, wind).await;
    return Err(anyhow::anyhow!(fln!(msg)));
  }

  let addr = pkt::CMD_ADDR_WIND_MODE;
  let msg = cmd.msg.clone().unwrap_or("".to_owned());

  let wind = if msg == "On" { true } else { false };

  log::debug!("[DOORI] addr is {addr}(seq:{}) msg {} wind {}", model.gate_seq, msg, wind);

  let rslt = modbus.write_single_coil(addr, wind).await;
  let wind = if wind { DooriWindMode::Wind } else { DooriWindMode::Def };
  if let Err(e) = rslt {
    //실패.
    let msg = format!("[DOORI] modbus write errro {e:?} {} {}", cmd.cmd_type, cmd.gate_seq);
    log::error!("{msg}");
    let rslt = GateCmdRsltType::Fail;
    let stat = GateStatus::Na;
    doori_send_cmd_res_all(&ctx, &cmd, rslt, stat, msg.clone(), automan, remloc, wind).await;
    return Err(anyhow::anyhow!(fln!(msg)));
  }
  log::debug!("[DOORI] wind success {} {}", cmd.cmd_type, cmd.gate_seq);
  doori_send_cmd_res_all(
    &ctx,
    &cmd,
    GateCmdRsltType::Success,
    stat,
    String::new(),
    automan,
    remloc,
    wind,
  )
  .await;

  Ok(DoGateCmdRslt::Success)
}
