use crate::entities::tb_gate;
use crate::gate_app::gate::{autogate, doori, fptech, hngsk, hpsys, hpsys_crtn, itson, realsys, sysbase, yesung};
use crate::models::cd::{GateCmdRsltType, GateCmdType, GateStatus, GateType};
use crate::svc::{self, gate::svc_gate};
use crate::{ectx, GateCtx};
pub use gate_cmd::*;
use log::{debug, error, info};
use sea_orm::DatabaseConnection;
use std::collections::HashMap;
use std::fmt::Debug;
use std::str::FromStr;
use std::sync::Arc;
use strum::ParseError;
use tokio::sync::Mutex;

pub mod autodown;
mod ebrd;
mod emcall;
pub mod gate;
mod gate_cmd;
mod gate_down;
mod mgr;
mod modbus;
pub mod tx_gate;
mod util;

async fn spawn_do_cmd(
  gate_type: Result<GateType, ParseError>,
  model: tb_gate::Model,
  ctx: GateCtx,
  gate_info: GateInfo,
  cmd: GateCmd,
) {
  let mut count = gate_info.count.lock().await;
  *count = *count + 1;
  let seq = model.gate_seq;
  let cmdmsg = cmd.msg.clone().unwrap_or("".to_owned());
  info!("[GATE] Lock {count} seq is {seq}{cmdmsg}");
  let rlt = {
    let model = model.clone();
    let ctx = ctx.clone();
    let cmd = cmd.clone();
    let rlt = match gate_type {
      Ok(GateType::Autogate) => {
        // 오토게이트 바형
        autogate::do_cmd(ctx, model, cmd).await
      }
      Ok(GateType::Itson) => {
        // 이츠온 문형.
        itson::do_cmd(ctx, model, cmd).await
      }
      Ok(GateType::Hpsys) => {
        // HP시스템 (차단막형)
        hpsys::do_cmd(ctx, model, cmd).await
      }
      Ok(GateType::HpsysCrtn) => {
        // HP시스템 (커튼형)
        hpsys_crtn::do_cmd(ctx, model, cmd).await
      }
      Ok(GateType::Doori) => {
        // 도어이 문형.
        doori::do_cmd(ctx, model, cmd).await
      }
      Ok(GateType::Hngsk) => {
        // 차단막문주형
        hngsk::do_cmd(ctx, model, cmd).await
      }
      Ok(GateType::Fptech) => {
        // 에프피테크
        fptech::do_cmd(ctx, model, cmd).await
      }
      Ok(GateType::Sysbase) => {
        // 시스템베이스
        sysbase::do_cmd(ctx, model, cmd).await
        // log::error!("[GATE] Sysbase not implemented");
        // Ok(DoGateCmdRslt::Success)
      }
      Ok(GateType::Realsys) => {
        // 리얼시스
        realsys::do_cmd(ctx, model, cmd).await
        // log::error!("[GATE] Realsys not implemented");
        // Ok(DoGateCmdRslt::Success)
      }
      Ok(GateType::Yesung) => {
        // 예성
        yesung::do_cmd(ctx, model, cmd).await
        // log::error!("[GATE] Yesung not implemented");
        // Ok(DoGateCmdRslt::Success)
      }
      Err(e) => {
        // 모름.
        let msg = format!("[GATE] Unknown Type {gate_type:?} seq is {}{cmdmsg}", model.gate_seq);
        error!("{msg}");
        Err(ectx!(anyhow::Error::new(e), msg))
      }
    };
    rlt
  };
  if let Err(e) = rlt {
    error!("에러 : cmd_type {} {e:?}", cmd.cmd_type);
  }

  //error!("{}", flnf!("[GATE] Error seq is {seq}{cmdmsg}"));
  //
  // // 연관 비상통화장치 송출그룹 전송.
  // if let Err(e) = emcall::do_autodown_emcall_grp(&ctx, &model).await {
  //   log::error!("[AUTODOWN] emcall_grp error {e:?}");
  // }

  // // 연곤 전광판 메시지 전송.
  // if let Err(e) = ebrd::do_autodown_ebrd(&ctx, &model).await {
  //   log::error!("[AUTODOWN] ebrd error {e:?}");
  // }

  info!("[GATE] UnLock {count} seq is {seq}{cmdmsg}");
  //crate::util::sleep(50).await; // 1초뒤에 락해제.
}

async fn do_cmd(ctx: &GateCtx, map: &Arc<Mutex<HashMap<i32, GateInfo>>>, cmd: GateCmd) {
  let cmdmsg = cmd.msg.clone().unwrap_or("".to_owned());
  let model = svc_gate::qry::Qry::find_by_id(&ctx.conn, cmd.gate_seq).await;
  if let Err(e) = model {
    error!("[GATE] gate not found seq {} err {e:?}{cmdmsg}", cmd.gate_seq);
    return;
  }
  let model = model.unwrap();
  if model == None {
    error!("[GATE] gate not found seq {}{cmdmsg}", cmd.gate_seq);
    return;
  }
  let model = model.unwrap();
  let mut map = map.lock().await;
  debug!(
    "[GATE] gate seq is {} cmd is {} , map len: {}{cmdmsg}",
    model.gate_seq,
    cmd,
    map.len()
  );
  if map.get(&cmd.gate_seq).is_none() {
    map.insert(
      cmd.gate_seq,
      GateInfo {
        count: Arc::new(Mutex::new(0)),
      },
    );
  }

  //let conn = conn.clone();
  match map.get(&cmd.gate_seq) {
    Some(gate_info) => {
      // 소켓으로 전송하고 나서, 이 결과를 처리할 것.
      info!("[GATE] gate info seq is {}{cmdmsg}", model.gate_seq);
      let gate_type = GateType::from_str(&model.gate_type);
      tokio::spawn(spawn_do_cmd(gate_type, model, ctx.clone(), gate_info.clone(), cmd));
    }
    None => {
      // 처리 결과 없음.
      if cmd.tx_api.is_none() {
        log::info!("[GATE] tx_api is none{cmdmsg}");
        return;
      }
      match cmd
        .tx_api
        .unwrap()
        .send(Box::from(GateCmdRes {
          cmd_res: GateCmdRsltType::Fail,
          cmd_res_msg: "".to_owned(),
          gate_status: GateStatus::Na,
        }))
        .await
      {
        Ok(_) => info!("[GATE] response success seq is {}{cmdmsg}", model.gate_seq),
        Err(e) => error!("[GATE] api send error {e:?}. seq is {}{cmdmsg}", model.gate_seq),
      }
    }
  }
}

#[derive(Debug, Clone)]
pub struct GateInfo {
  count: Arc<Mutex<i32>>,
}

async fn get_model_map(conn: &DatabaseConnection) -> HashMap<i32, GateInfo> {
  let rlt = svc::gate::svc_gate::qry::Qry::find_all(&conn).await;
  let models = match rlt {
    Ok(l) => l,
    _ => vec![],
  };

  let mut map: HashMap<i32, GateInfo> = HashMap::new();

  for model in models {
    map.insert(
      model.gate_seq,
      GateInfo {
        count: Arc::new(Mutex::new(0)),
      },
    );
  }
  return map;
}

/**
 * 게이트 메인 함수.
 * 게이트 명령을 받아서, 처리하고 결과를 반환.
 */
pub async fn gate_main(ctx: GateCtx, mut rx_gate: tokio::sync::mpsc::Receiver<Box<dyn IfGateCmd>>) {
  let map = get_model_map(&ctx.conn).await;

  let map: Arc<Mutex<HashMap<i32, GateInfo>>> = Arc::new(Mutex::new(map));

  let enable_gate_check = crate::util::get_env_bool("ENABLE_GATE_STATUS_CHECK", false);
  if enable_gate_check {
    tokio::spawn(mgr::mgr_main(map.clone(), ctx.clone()));
  }

  loop {
    tokio::select! {
      cmd = rx_gate.recv() => {
        match cmd  {
          Some(cmd) =>{
            if let Some(cmd) = cmd.downcast_ref::<GateCmd>() {
              debug!("[GATE] cmd is {}", cmd);
              do_cmd(&ctx, &map, cmd.clone()).await
            } else if let Some(cmd) = cmd.downcast_ref::<GateCmdGateDown>() {
              debug!("[GATE] gate down occured {:?}", cmd);
              gate_down::do_gate_down(&ctx, cmd.clone()).await;
            } else if let Some(cmd) = cmd.downcast_ref::<GateCmdGateAutoDown>() {
              debug!("[GATE] gate auto down occured {:?}", cmd);
              gate_down::do_gate_auto_down(&ctx, cmd.clone()).await;
            } else {
              log::error!("[GATE] cmd is not GateCmd");
            }
          },
          None => {
            log::error!("[GATE] cmd is None");
          }
        }
      }
    }
  }
}
