use crate::eanyhowf;
use crate::gate_app::tx_gate::send_gate_cmd;
use crate::gate_app::GateCmd;
use crate::models::cd::GateCmdType;
use crate::svc::water::{svc_water_gate, svc_water_grp_stat};
use crate::water::recv_worker::{grp_util, water_grp_lock};
use crate::ws::wsmodels::GrpAction;
use sea_orm::*;

/**
 * water_seqs 를 이용해서, gate_seqs 를 구한다음, 각 gate에 명령처리 요청.
 */
async fn send_water_grp_cmd(db: &DbConn, water_seqs: (i32, i32), cmd_type: GateCmdType, msg: String) -> anyhow::Result<()> {
  for water_seq in [water_seqs.0, water_seqs.1] {
    let gates = svc_water_gate::qry::Qry::find_gate_by_water_seq(db, water_seq).await?;

    for gate in gates {
      send_gate_cmd(Box::new(GateCmd {
        cmd_type,
        gate_seq: gate.gate_seq,
        tx_api: None,
        msg: Some(msg.clone()),
      }))
      .await;
    }
  }

  Ok(())
}

async fn _handle_grp_action(db: &DbConn, water_grp_id: &str, grp_action: GrpAction) -> anyhow::Result<()> {
  // lock
  let lock = water_grp_lock::get_water_grp_lock(water_grp_id).await;
  let _lock = lock.lock().await;

  // 조회.
  let stat = svc_water_grp_stat::qry::Qry::find_by_id(&db, water_grp_id)
    .await?
    .ok_or(eanyhowf!("water_grp_id not found {water_grp_id} {grp_action}"))?;

  let saved_action = GrpAction::try_from(stat.action.as_str()).unwrap_or(GrpAction::None);

  if grp_action == GrpAction::Autodown {
    // 자동차단인 경우, 어떤 액션이 처리된 경우 수행하지 않는다.
    if saved_action != GrpAction::None {
      return Err(eanyhowf!("water_grp_id already has action {water_grp_id} {grp_action}"));
    }
  }

  // 액션 처리.
  // 1. 업데이트 액션.
  // 2. 각 액션에 따른 처리.

  let seqs = grp_util::get_grp_water_seqs(water_grp_id)?;
  svc_water_grp_stat::mtn::Mtn::update_action(&db, water_grp_id, grp_action).await?;

  if grp_action == GrpAction::Autodown || grp_action == GrpAction::Down {
    let msg = format!("grp_action: {water_grp_id} {grp_action}");
    send_water_grp_cmd(&db, seqs, GateCmdType::DownAsync, msg).await?;
  } else if grp_action == GrpAction::Close {
    // 차단 해제인 경우, 어떤 액션이 처리된 경우 수행하지 않는다.
    log::debug!("grp_action: {water_grp_id} {grp_action}");
  } else if grp_action == GrpAction::Stop {
    let msg = format!("grp_action: {water_grp_id} {grp_action}");
    send_water_grp_cmd(&db, seqs, GateCmdType::Stop, msg).await?;
  } else {
    // 아무것도 하지 않는다.
    log::error!("unknown grp_action {water_grp_id} {grp_action}");
  }

  Ok(())
}

pub async fn handle_grp_action(db: DbConn, water_grp_id: String, grp_action: GrpAction) -> anyhow::Result<()> {
  let rslt = _handle_grp_action(&db, &water_grp_id, grp_action).await;
  if let Err(e) = rslt {
    log::error!("handle_grp_action error {:?} {water_grp_id} {grp_action}", e);
    return Err(e);
  }

  Ok(())
}
