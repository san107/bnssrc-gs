use super::{autogate, itson, GateInfo};
use crate::{
  entities::tb_gate,
  gate_app::gate::{doori, fptech, hngsk, hpsys, hpsys_crtn, realsys, sysbase, yesung},
  models::cd::GateType,
  svc::gate::svc_gate,
  GateCtx,
};
use log::error;
use std::{collections::HashMap, str::FromStr, sync::Arc};
use tokio::{select, sync::Mutex, time};

/**
 * 각 GateInfo에 대해서, 상태를 취득하고 이를 GateInfo에 저장할 수 있도록, tx로 전송.
 */
async fn do_stat_cmd(ctx: GateCtx, model: tb_gate::Model, gi: GateInfo) {
  //
  let _ = gi.count.lock().await; // 동시에 작업하지 못하도록.
  let seq = model.gate_seq;
  //log::info!("[데몬] Lock seq is {seq}");
  let model = crate::gate_app::util::get_gate_model(&ctx.conn, seq).await;
  if model.is_none() {
    log::error!("[데몬] model not found {seq}");
    return;
  }
  let model = model.unwrap();
  if let Ok(gt) = GateType::from_str(&model.gate_type) {
    //
    match gt {
      GateType::Autogate => {
        // 오토게이트.
        autogate::mgr::mgr_get_status(ctx, model).await;
      }
      GateType::Itson => {
        // 이츠온
        itson::mgr::mgr_get_status(ctx, model).await;
      }
      GateType::Hpsys => {
        // HP 차단막.
        hpsys::mgr::mgr_get_status(ctx, model).await;
      }
      GateType::HpsysCrtn => {
        // HP 커튼.
        hpsys_crtn::mgr::mgr_get_status(ctx, model).await;
      }
      GateType::Doori => {
        // 도어이
        doori::mgr::mgr_get_status(ctx, model).await;
      }
      GateType::Hngsk => {
        // 차단막문주형.
        hngsk::mgr::mgr_get_status(ctx, model).await;
      }
      GateType::Fptech => {
        // 에프피테크 문형.
        fptech::mgr::mgr_get_status(ctx, model).await;
      }
      GateType::Sysbase => {
        // 시스템베이스
        sysbase::mgr::mgr_get_status(ctx, model).await;
        //log::error!("[데몬] Sysbase not implemented");
      }
      GateType::Realsys => {
        // 리얼시스
        realsys::mgr::mgr_get_status(ctx, model).await;
        //log::error!("[데몬] Realsys not implemented");
      }
      GateType::Yesung => {
        // 예성
        yesung::mgr::mgr_get_status(ctx, model).await;
      }
    }
  }
  //log::info!("[데몬] UnLock seq is {seq}");
  crate::util::sleep(100).await; // 1초뒤에 락해제.
}

async fn do_mgr_main_interval(map: &Arc<Mutex<HashMap<i32, GateInfo>>>, ctx: &GateCtx) {
  // debug!("timeout ")
  // 전체 루프 돌면서, 상태 요청할 것. 요청 결과는, rx에서 업데이트 하는 것으로

  // 전체 게이트 목록 가져올 것.
  log::info!("[데몬] Start Process");
  let list = svc_gate::qry::Qry::find_all(&ctx.conn).await;
  if let Err(e) = list {
    error!("[데몬] find_all error {:?}", e);
    return;
  }
  let list = list.unwrap();

  let mut map = map.lock().await;
  for model in list {
    if map.get(&model.gate_seq).is_none() {
      log::info!("[데몬] insert gate_seq {}", model.gate_seq);
      map.insert(
        model.gate_seq,
        GateInfo {
          count: Arc::new(Mutex::new(0)),
        },
      );
    }
    if let Some(gi) = map.get(&model.gate_seq) {
      tokio::spawn(do_stat_cmd(ctx.clone(), model.clone(), gi.clone()));
    } else {
      // 없을 때 추가하고 들어오기 때문에 이쪽으로는 빠지는 경우 없어야 함.
      error!("[데몬] not found gate_seq {}", model.gate_seq);
    }
  }
}

// 특정 타입의 경우에만 호출되며, 특정경우에만 처리함.
async fn do_heartbeat(ctx: GateCtx, model: tb_gate::Model, gi: GateInfo) {
  let _ = gi.count.lock().await; // 동시에 작업하지 못하도록.

  if let Ok(gt) = GateType::from_str(&model.gate_type) {
    if gt == GateType::HpsysCrtn {
      // gate type 이 HpsysCrtn 인 경우에만 heartbeat 처리.
      hpsys_crtn::mgr::mgr_do_hearbeat(ctx, model).await;
      return;
    } else if gt == GateType::Hpsys {
      // gate type 이 Hpsys 인 경우에만 heartbeat 처리.
      hpsys::mgr::mgr_do_hearbeat(ctx, model).await;
      return;
    }
  }
  crate::util::sleep(100).await; // 1초뒤에 락해제.
}

async fn do_mgr_main_heartbeat(map: &Arc<Mutex<HashMap<i32, GateInfo>>>, ctx: &GateCtx) {
  // debug!("timeout ")
  // 전체 루프 돌면서, 상태 요청할 것. 요청 결과는, rx에서 업데이트 하는 것으로

  // 전체 게이트 목록 가져올 것.
  log::info!("[데몬] Start Process");
  let list = svc_gate::qry::Qry::find_all(&ctx.conn).await;
  if let Err(e) = list {
    error!("[데몬] find_all error {:?}", e);
    return;
  }
  let list = list.unwrap();

  let mut map = map.lock().await;
  for model in list {
    if map.get(&model.gate_seq).is_none() {
      log::info!("[데몬] insert gate_seq {}", model.gate_seq);
      map.insert(
        model.gate_seq,
        GateInfo {
          count: Arc::new(Mutex::new(0)),
        },
      );
    }
    if let Some(gi) = map.get(&model.gate_seq) {
      if let Ok(gt) = GateType::from_str(&model.gate_type) {
        if gt == GateType::HpsysCrtn || gt == GateType::Hpsys {
          // gate type 이 HpsysCrtn 인 경우에만 heartbeat 처리.
          tokio::spawn(do_heartbeat(ctx.clone(), model.clone(), gi.clone()));
        }
      }
    } else {
      // 없을 때 추가하고 들어오기 때문에 이쪽으로는 빠지는 경우 없어야 함.
      error!("[데몬] not found gate_seq {}", model.gate_seq);
    }
  }
}

pub async fn mgr_main(map: Arc<Mutex<HashMap<i32, GateInfo>>>, ctx: GateCtx) {
  //let gate_check_secs = util::get_env_u64("GATE_CHECK_SECS", 60);
  let gate_check_secs = 30; // 30 초마다 heartbeat write 하고, 상태 체크는 1분 고정으로 처리함.

  tokio::time::sleep(tokio::time::Duration::from_secs(5)).await; // 5초 대기

  let mut interval = time::interval(time::Duration::from_secs(gate_check_secs));
  log::info!("[데몬] Gate Manager Start with interval {} secs", gate_check_secs);

  let mut toggle = false;
  loop {
    select! {
      _ = interval.tick() =>{
        toggle = !toggle;
        if toggle {
          // 상태체크안에서도 heartbeat 처리함.
          do_mgr_main_interval(&map, &ctx).await;
        }else {
          do_mgr_main_heartbeat(&map, &ctx).await;
        }
      }
    }
  }
}
