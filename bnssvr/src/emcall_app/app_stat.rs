use super::{app::TxCtx, model::ItgStat};
use crate::{
  emcall_app::{
    self,
    model::{ItgStatErr, ItgStatWrap},
  },
  entities::tb_emcall_grp,
  models::cd::CommStat,
  svc::emcall::svc_emcall_grp,
};
use sea_orm::DbConn;
use std::sync::Arc;
use tokio::sync::{broadcast, Mutex};

async fn do_stat_err(model: &tb_emcall_grp::Model, err_msg: String) {
  log::info!(
    "itg-emcall-grp stat err {}({}) msg:{}",
    model.emcall_grp_nm,
    model.emcall_grp_seq,
    err_msg
  );
  if model.comm_stat == Some(CommStat::Err.to_string()) {
    log::info!(
      "itg-emcall-grp same stat err {}({})",
      model.emcall_grp_nm,
      model.emcall_grp_seq
    );
    return;
  }
  // history 저장 및 웹소켓 전송.
  let stat = ItgStatErr {
    emcall_grp_seq: model.emcall_grp_seq,
    user_id: "[DEMON]".to_string(),
    device_id: model.emcall_grp_id.clone(),
    err_msg: err_msg,
  };

  emcall_app::app::emcall_send(Box::new(stat)).await;
}

async fn get_emcall_grp_stat(model: tb_emcall_grp::Model) {
  let url = emcall_app::get_emcall_grp_stat_url(&model);
  log::info!("emcall grp stat url: {}", url);
  let client = reqwest::Client::builder()
    .timeout(std::time::Duration::from_secs(emcall_app::REQWEST_TIMEOUT))
    .build()
    .unwrap();
  let resp = client.get(url).send().await;
  if let Err(e) = resp {
    log::error!("emcall grp stat error: {}", e);
    do_stat_err(&model, format!("{}", e)).await;
    return;
  }
  let resp = resp.unwrap();
  let body = resp.json::<ItgStat>().await;
  if let Err(e) = body {
    log::error!("emcall grp stat error: {}", e);
    do_stat_err(&model, format!("{}", e)).await;
    return;
  }
  let body = body.unwrap();
  log::info!("emcall grp stat: {:?}", body);
  // 정상케이스.
  let stat_wrap = ItgStatWrap {
    emcall_grp_seq: model.emcall_grp_seq,
    user_id: "[DEMON]".to_string(),
    stat: body.clone(),
  };
  if model.comm_stat != Some(CommStat::Ok.to_string()) {
    emcall_app::app::emcall_send(Box::new(stat_wrap)).await;
    return;
  }

  let stat_json = serde_json::to_string(&body).unwrap();
  if model.emcall_grp_stat_json == Some(stat_json) {
    log::info!("emcall grp stat is same");
    return;
  }

  emcall_app::app::emcall_send(Box::new(stat_wrap)).await;
}

#[allow(unused_variables)]
async fn stat_handler(ctx: Arc<Mutex<TxCtx>>, db: DbConn, tx_ws: broadcast::Sender<Box<String>>) {
  // 상태관리자.
  loop {
    tokio::time::sleep(tokio::time::Duration::from_secs(60)).await;
    //tokio::time::sleep(tokio::time::Duration::from_secs(5)).await;

    let emcall_enable = crate::util::get_env_bool("EMCALL_ENABLE", false);

    if !emcall_enable {
      log::info!("emcall is not enable");
      continue;
    }

    // Check status and handle any changes
    log::debug!("Checking emcall status...");
    let grps = svc_emcall_grp::qry::Qry::find_all_root(&db).await;
    if let Err(e) = grps {
      log::error!("emcall grp find_all_root error: {}", e);
      continue;
    }
    let grps = grps.unwrap();
    log::info!("emcall grp count: {}", grps.len());
    for grp in grps {
      log::info!("emcall grp: {}", grp.emcall_grp_id);
      // 상태정보 가져오는 프로세스.
      tokio::spawn(get_emcall_grp_stat(grp));
    }
  }
}

pub fn start_stat_app(ctx: &Arc<Mutex<TxCtx>>, db: &DbConn, tx_ws: &broadcast::Sender<Box<String>>) {
  tokio::spawn(stat_handler(ctx.clone(), db.clone(), tx_ws.clone()));
}
