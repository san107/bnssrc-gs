use crate::{
  eanyhow,
  entities::{tb_gate, tb_water},
  err,
  gate_app::{tx_gate::send_gate_cmd, GateCmd},
  models::cd::{GateCmdType, GateStatus, WaterStat},
  svc::water::svc_water_gate,
};
use sea_orm::*;
use std::str::FromStr;

async fn do_autodown(gate: &tb_gate::Model, water: &tb_water::Model) {
  // 로깅 메시지.
  let msg = format!(
    "(AutoDown: by {} level {} m {})",
    water.water_nm,
    if water.water_level.is_none() {
      "".to_owned()
    } else {
      format!("{}", water.water_level.as_ref().unwrap())
    },
    if water.water_stat.is_none() {
      "".to_owned()
    } else {
      format!("{}", water.water_stat.as_ref().unwrap())
    }
  );

  log::info!("[AUTODOWN] gate auto down request {} {}", gate.gate_seq, msg);
  send_gate_cmd(Box::new(GateCmd {
    cmd_type: GateCmdType::AutoDown,
    gate_seq: gate.gate_seq,
    tx_api: None,
    msg: Some(msg),
  }))
  .await;
}

pub async fn autodown(db: &DbConn, water: &tb_water::Model) -> anyhow::Result<()> {
  //
  // 1. 연동 차단기를 검색한다.
  // 2. 차단조건인지 확인한다.
  // 3. 차단 조건이면, 차단 요청 처리한다.

  //let water = water.clone();

  let water_stat = water
    .water_stat
    .as_ref()
    .ok_or_else(|| eanyhow!("[AUTODOWN] 수위계 상태 알 수 없음"))
    .map(|v| WaterStat::from_str(&v))?
    .map_err(|e| err!(e, "[AUTODOWN] 수위계 상태 파싱 실패"))?;

  // 수위계ID를 기준으로 연동 차단기 목록 조회.
  let seq = water.water_seq;
  let gates = svc_water_gate::qry::Qry::find_gate_by_water(db, seq)
    .await
    .map_err(|e| err!(e, "[AUTODOWN] 연동 차단기 조회 실패"))?;

  // let gates = gates.unwrap();
  // 각 게이트 항목을 돌면서 차단조건인지 확인.
  // 차단 조건은, 설정된 정보 보다 상위 조건인 경우, 차단.

  log::info!("[AUTODOWN] water : {water:?} gates {:?}", gates);

  for gate in gates {
    if gate.down_type != "Auto" {
      // 자동차단 조건이 아닌 경우. 처리하지 않음.
      log::debug!("[AUTODOWN] 자동차단 조건이 아닌 경우. {gate:?}");
      continue;
    }

    let cond = gate.auto_down_cond.as_ref();
    if cond.is_none() {
      log::error!("[AUTODOWN] 자동차단 조건이 없음. {gate:?}");
      continue;
    }
    let cond = cond.unwrap();
    let cond = WaterStat::from_str(&cond);
    if let Err(e) = cond {
      log::error!("[AUTODOWN] autodown 조건 알 수 없음 {e:?}");
      continue;
    }
    let cond = cond.unwrap();
    log::info!("[AUTODOWN] cond : {cond:?} water_stat : {water_stat:?}");
    if cond <= water_stat {
      log::info!("[AUTODOWN] 차단 조건 만족. {cond:?} <= {water_stat:?}");
      // 수위계 상태가 설정한 조건보다 크거나 같은 경우. 발생조건임.

      // 현재 다운상태가 아닌경우, autodown 요청.
      let gstat = gate.gate_stat.as_ref();
      if gstat.is_none() {
        // 요청할 것.
        log::info!(
          "[AUTODOWN] 게이트 상태 모름. 차단 요청함. {} {cond:?} {water_stat:?}",
          water.water_dev_id
        );
        do_autodown(&gate, water).await;
        continue;
      }
      let gstat = gstat.unwrap();
      let gstat = GateStatus::from_str(&gstat);
      if let Err(e) = gstat {
        log::error!(
          "[AUTODOWN] gate 상태 알 수 없음 {e:?} {} {cond:?} {water_stat:?}",
          water.water_dev_id
        );
        do_autodown(&gate, water).await;
        continue; // 상태를 모를 경우도 요청할 것.
      }
      let gstat = gstat.unwrap();
      if gstat != GateStatus::DownOk {
        //
        log::warn!(
          "[AUTODOWN] 게이트가 Down상태가 아님. Down하도록 요청함 {} {cond:?} {water_stat:?}",
          water.water_dev_id
        );
        do_autodown(&gate, water).await;
      } else {
        log::debug!(
          "[AUTODOWN] 게이트가 Down상태임. 차단 요청 안함. {} {cond:?} {water_stat:?}",
          water.water_dev_id
        );
      }
    }
  }

  Ok(())
}
