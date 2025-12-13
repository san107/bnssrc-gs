use crate::{
  emcall_app::{self, model::ItgStat},
  entities::{tb_emcall_grp, tb_emcall_grp_stat_hist},
  svc::{
    emcall::{svc_emcall_grp, svc_emcall_grp_stat_hist},
    gate::svc_gate_emcall_grp,
  },
  GateCtx,
};
use chrono::Local;
use sea_orm::DbConn;

async fn get_emall_stat(db: &DbConn, seq: i32) -> Result<ItgStat, String> {
  let obj = svc_emcall_grp::qry::Qry::find_by_id(db, seq)
    .await
    .map_err(|e| format!("emcall_grp 조회 실패 {e:?}"))?
    .ok_or("emcall_grp 조회 실패 - None")?;

  let url = emcall_app::get_emcall_grp_stat_url(&obj);
  emcall_app::get_emcall_grp_stat(url).await
}

async fn save_emcall_grp_stat_hist(
  ctx: &GateCtx,
  grp: &tb_emcall_grp::Model,
  stat: &ItgStat,
  ret: Result<(), String>,
) -> Result<(), String> {
  let hist = tb_emcall_grp_stat_hist::Model {
    emcall_grp_stat_hist_seq: -1,
    emcall_grp_id: grp.emcall_grp_id.clone(),
    emcall_grp_stat_json: Some(serde_json::to_string(&stat).unwrap_or_default()),
    emcall_grp_stat_dt: Local::now().naive_local(),
    comm_stat: if ret.is_ok() { "Ok" } else { "Err" }.to_string(),
    comm_stat_msg: if ret.is_ok() {
      String::new()
    } else {
      ret.err().unwrap().to_string()
    },
    user_id: "[DEMON]".to_string(),
  };
  svc_emcall_grp_stat_hist::mtn::Mtn::save(&ctx.conn, hist)
    .await
    .map_err(|e| format!("emcall_grp_stat_hist 저장 실패 {e:?}"))?;

  Ok(())
}

async fn send_emcall_msg(ctx: &GateCtx, grp: &tb_emcall_grp::Model) -> Result<(), String> {
  // 1. 송출중인 메시지 확인.
  let stat = get_emall_stat(&ctx.conn, grp.emcall_grp_seq).await?;
  // 2. 송출하려는 메시지와 동일한지 확인.
  // let msg = stat.msg == "On";
  let is_msg_empty = stat.tts_msg.is_empty();
  let light = stat.light == "On";
  let speaker = stat.speaker == if is_msg_empty { "On" } else { "Off" };
  let speaker_tts = stat.speaker_tts == if is_msg_empty { "Off" } else { "On" };
  let tts_msg = if is_msg_empty {
    true
  } else {
    Some(stat.tts_msg.as_str()) == grp.emcall_tts_msg.as_ref().map(|e| e.as_str())
  };

  if light && speaker && speaker_tts && tts_msg {
    log::info!("[AUTODOWN] emcall_grp 메시지 동일함 {grp:?} {stat:?}");
    return Ok(());
  }

  let stat = ItgStat {
    device_id: grp.emcall_grp_id.clone(),
    msg: "On".to_string(),
    light: "On".to_string(),
    speaker: if is_msg_empty { "On" } else { "Off" }.to_string(),
    speaker_tts: if is_msg_empty { "Off" } else { "On" }.to_string(),
    tts_msg: grp.emcall_tts_msg.clone().unwrap_or_default(),
  };

  let url = emcall_app::get_emcall_grp_send_url(&grp);
  let ret = emcall_app::send_emcall_grp_stat(url, stat.clone()).await;

  if ret.is_err() {
    log::error!("[AUTODOWN] emcall_grp 메시지 전송 실패 {grp:?} {:?}", ret.as_ref());
  }

  save_emcall_grp_stat_hist(ctx, grp, &stat, ret).await?;

  // 3. 동일하지 않은 경우, 송출메시지 송출.
  Ok(())
}

// autodown 이벤트 루프에서 처리하는게 맞을 듯.
pub async fn do_autodown_emcall_grp(ctx: &GateCtx, gate_seq: i32) -> Result<(), String> {
  let grps = svc_gate_emcall_grp::qry::Qry::find_emcall_grp_by_gate_seq(&ctx.conn, gate_seq)
    .await
    .map_err(|e| format!("emcall_grp 조회 실패 {e:?}"))?;

  for grp in grps {
    // 1. 송출중인 메시지 확인.
    // 2. 송출중이지 않으면 메시지 송출요청.
    if let Err(e) = send_emcall_msg(ctx, &grp).await {
      log::error!("[AUTODOWN] emcall_grp 메시지 전송 실패 {grp:?} {e:?}");
    }
  }

  Ok(())
}
