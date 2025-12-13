use crate::{
  eanyhowf,
  entities::{tb_water, tb_water_hist},
  errf,
  models::cd::{WaterMod, WaterStat},
  ndms::{ndms_app::ndms_send_water, ndms_model::NdmsWater},
  svc::water::{svc_water, svc_water_hist},
  water::{self, recv_worker::WaterRecvCmd},
  ws::{
    wsmodels::{WsCmd, WsMsg},
    wssender,
  },
};
use sea_orm::*;

async fn do_water_grp_stat(water_stat: &str, water: &tb_water::Model) {
  // 상태가 다른 경우, 수위계그룹확인 후, 업데이트 처리.
  if Some(water_stat) == water.water_stat.as_deref() {
    return;
  }
  if water.water_mod != WaterMod::Grp.to_string() {
    return;
  }
  // 낮아지는 경우도 처리함.
  // 수위계그룹확인 후, 업데이트 처리.

  // 수위계그룹확인 후, 업데이트 처리.
  // water_stat(String) 값을 WaterStat enum으로 변환
  let water_stat = WaterStat::try_from(water_stat).unwrap_or(WaterStat::Unknown);
  water::recv_worker::send(WaterRecvCmd::GrpWaterStat(water.water_seq, water_stat)).await;
}

pub async fn do_water_data_recv(db: &DbConn, hist: &tb_water_hist::Model) -> anyhow::Result<()> {
  ndms_send_water(NdmsWater {
    water_dev_id: hist.water_dev_id.clone(),
    water_dt: hist.water_dt,
    water_level: hist.water_level,
  })
  .await;

  let old_water = svc_water::qry::Qry::find_by_devid(db, &hist.water_dev_id)
    .await
    .map_err(|e| errf!(e, "find_by_devid Error {}", hist.water_dev_id))?
    .ok_or_else(|| eanyhowf!("find_by_devid Error {}", hist.water_dev_id))?;

  let old_water_stat = old_water.water_stat.clone().unwrap_or_default();

  let new_water_stat = crate::util::get_water_stat(old_water.clone(), hist.water_level);
  log::info!("new_stat : {new_water_stat:?} old_stat : {old_water_stat:?}");

  let w = &old_water;
  loop {
    let rslt = svc_water::mtn::Mtn::update_evt(db, &hist).await;
    if let Err(e) = rslt {
      log::error!("update_evt error {:?} ({}){} {}", e, w.water_seq, w.water_dev_id, w.water_nm);
      break;
    }
    let new_water = rslt
      .unwrap()
      .try_into_model()
      .map_err(|e| errf!(e, "try into model error {}:{}:{}", w.water_seq, w.water_dev_id, w.water_nm))?;
    if Some(&new_water_stat) == old_water.water_stat.as_ref() {
      log::debug!("water_stat is same stat {:?}", old_water.water_stat);
      break;
    }

    // 상태가 다른 경우, 수위계그룹확인 후, 업데이트 처리.
    do_water_grp_stat(&new_water_stat, &old_water).await;

    log::info!("autodown start {}:{}:{}", w.water_seq, w.water_dev_id, w.water_nm);
    let rslt = crate::gate_app::autodown::autodown(db, &new_water).await;
    if let Err(e) = rslt {
      log::error!("autodown error {:?} {}:{}:{}", e, w.water_seq, w.water_dev_id, w.water_nm);
    }
    log::info!("autodown end {}:{}:{}", w.water_seq, w.water_dev_id, w.water_nm);
    crate::sms::do_sms_water_event(db, &new_water, &old_water_stat).await;
    break;
  }

  // 업데이트 하도록.
  let msg = WsMsg {
    cmd: WsCmd::WaterEvt,
    data: hist.clone(),
  };

  // 업데이트 처리할 것.
  wssender::send_ws_msg(msg).await;

  Ok(())
}

pub async fn do_water_onoff2(db: &DbConn, dev_id: &str, onoff1: bool, onoff2: bool) -> anyhow::Result<()> {
  let hist = svc_water_hist::mtn::Mtn::save_onoff2(&db, dev_id, onoff1, onoff2).await?;
  let hist = hist.try_into_model()?;

  do_water_data_recv(db, &hist).await?;

  Ok(())
}

pub async fn do_water_onoff1(db: &DbConn, dev_id: &str, onoff1: bool) -> anyhow::Result<()> {
  let hist = svc_water_hist::mtn::Mtn::save_onoff1(&db, dev_id, onoff1).await?;
  let hist = hist.try_into_model()?;

  do_water_data_recv(db, &hist).await?;

  Ok(())
}

pub async fn do_water_level(db: &DbConn, dev_id: &str, level: f64) -> anyhow::Result<()> {
  let hist = svc_water_hist::mtn::Mtn::save_level(&db, dev_id, level).await?;
  let hist = hist.try_into_model()?;

  do_water_data_recv(db, &hist).await?;

  Ok(())
}
