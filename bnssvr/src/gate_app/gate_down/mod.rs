use crate::{
  gate_app::{ebrd, emcall, GateCmdGateAutoDown, GateCmdGateDown},
  GateCtx,
};

// oper_mode 가 Down 또는 AutoDown 인 경우에만 처리.
// 차단시에 호출됨. Down 인 경우에만 처리함.
pub async fn do_gate_down(ctx: &GateCtx, cmd: GateCmdGateDown) {
  log::info!("gate down occured {:?}", cmd);

  // 연관 비상통화장치 송출그룹 전송.
  loop {
    let ctx = ctx.clone();
    let mode = cmd.gate.emcall_oper_mode.unwrap_or_default();
    //if mode != "Down" && mode != "AutoDown" {
    if mode != "Down" {
      log::info!("[GATE_DOWN] emcall_oper_mode is not Down mode is {mode}");
      break;
    }

    tokio::spawn(async move {
      if let Err(e) = emcall::do_autodown_emcall_grp(&ctx, cmd.gate_seq).await {
        log::error!("[GATE_DOWN] emcall_grp error {e:?}");
      }
    });
    break;
  }

  // 연곤 전광판 메시지 전송.
  loop {
    let ctx = ctx.clone();
    let mode = cmd.gate.ebrd_oper_mode.unwrap_or_default();
    //if mode != "Down" && mode != "AutoDown" {
    if mode != "Down" {
      log::info!("[GATE_DOWN] ebrd_oper_mode is not Down mode is {mode}");
      break;
    }

    tokio::spawn(async move {
      if let Err(e) = ebrd::do_autodown_ebrd(&ctx, cmd.gate_seq).await {
        log::error!("[GATE_DOWN] ebrd error {e:?}");
      }
    });
    break;
  }
}

// oper_mode 가 AutoDown 인 경우에만 처리.
// 자동차단시에 호출됨. AutoDown, Down 인 경우에 처리함.
pub async fn do_gate_auto_down(ctx: &GateCtx, cmd: GateCmdGateAutoDown) {
  log::info!("gate auto down occured {:?}", cmd);

  // 연관 비상통화장치 송출그룹 전송.
  loop {
    let mode = cmd.gate.emcall_oper_mode.unwrap_or_default();

    if mode != "AutoDown" && mode != "Down" {
      log::info!("[AUTODOWN] emcall_oper_mode is not AutoDown or Down mode is {mode}");
      break;
    }

    let ctx = ctx.clone();

    tokio::spawn(async move {
      if let Err(e) = emcall::do_autodown_emcall_grp(&ctx, cmd.gate_seq).await {
        log::error!("[AUTODOWN] emcall_grp error {e:?}");
      }
    });
    break;
  }

  // 연곤 전광판 메시지 전송.
  loop {
    let mode = cmd.gate.ebrd_oper_mode.unwrap_or_default();
    if mode != "AutoDown" && mode != "Down" {
      log::info!("[AUTODOWN] ebrd_oper_mode is not AutoDown or Down mode is {mode}");
      break;
    }

    let ctx = ctx.clone();

    tokio::spawn(async move {
      if let Err(e) = ebrd::do_autodown_ebrd(&ctx, cmd.gate_seq).await {
        log::error!("[AUTODOWN] ebrd error {e:?}");
      }
    });
    break;
  }
}
