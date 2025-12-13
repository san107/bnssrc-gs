use crate::{
  eanyhowf,
  entities::tb_water_hist,
  errf,
  ndms::{ndms_app::ndms_send_water, ndms_model::NdmsWater},
  svc::water::{svc_water, svc_water_hist},
  water::{self, recv_worker::WaterRecvCmd},
  ws::wsmodels::{WsCmd, WsMsg},
};
use actix_web::{web, HttpResponse, Responder};
use log::info;
use sea_orm::TryIntoModel;
use serde_json::json;

#[allow(dead_code)]
async fn do_eventmsg(
  app: &web::Data<crate::AppState>,
  info: web::Json<serde_json::Value>,
) -> anyhow::Result<tb_water_hist::Model> {
  let obj = svc_water_hist::mtn::Mtn::save(&app.conn, info.clone())
    .await
    .map_err(|e| errf!(e, "Save Error {info:?}"))?;

  let hist = obj.try_into_model().unwrap();
  // model ==> 최신 저장된 데이터.

  // ndms 데이터 업데이트.
  ndms_send_water(NdmsWater {
    water_dev_id: hist.water_dev_id.clone(),
    water_dt: hist.water_dt,
    water_level: hist.water_level,
  })
  .await;

  let old_water = svc_water::qry::Qry::find_by_devid(&app.conn, &hist.water_dev_id)
    .await
    .map_err(|e| errf!(e, "find_by_devid Error {info:?}"))?
    .ok_or_else(|| eanyhowf!("find_by_devid Error {info:?}"))?;

  let old_water_stat = old_water.water_stat.clone().unwrap_or_default();

  let new_water_stat = crate::util::get_water_stat(old_water.clone(), hist.water_level);
  log::info!("new_water_stat : {new_water_stat:?} old_water_stat : {old_water_stat:?}");

  // update tb_water.
  loop {
    let rslt = svc_water::mtn::Mtn::update_evt(&app.conn, &hist).await;
    if let Err(e) = rslt {
      log::error!("update_evt error {:?} {info:?}", e);
      break;
    }
    let new_water = rslt
      .unwrap()
      .try_into_model()
      .map_err(|e| errf!(e, "try into model error {info:?}"))?;
    if Some(new_water_stat) == old_water.water_stat {
      log::debug!("water_stat is same stat {info:?} {:?}", old_water.water_stat);
      break;
    }
    log::info!("autodown start {info:?}");
    let rslt = crate::gate_app::autodown::autodown(&app.conn, &new_water).await;
    if let Err(e) = rslt {
      log::error!("autodown error {:?} {info:?}", e);
    }
    log::info!("autodown end {info:?}");
    crate::sms::do_sms_water_event(&app.conn, &new_water, &old_water_stat).await;
    break;
  }

  // 업데이트 하도록.
  let msg = WsMsg {
    cmd: WsCmd::WaterEvt,
    data: hist.clone(),
  };

  // 업데이트 처리할 것.
  app.tx_ws.send(Box::from(json!(msg).to_string())).unwrap();
  Ok(hist)
}

//#[post("/api/water/istec/eventmsg")]
pub async fn eventmsg(_app: web::Data<crate::AppState>, info: web::Json<serde_json::Value>) -> impl Responder {
  info!("water info {:?}", info);

  water::recv_worker::send(WaterRecvCmd::IstecEvt(info.into_inner())).await;

  HttpResponse::Ok()

  // let rslt = do_eventmsg(&app, info).await;
  // if let Err(e) = rslt {
  //   let msg = format!("do_eventmsg error {:?}", e);
  //   log::error!("{}", msg);
  //   return HttpResponse::InternalServerError().body(msg);
  // }
  // let model = rslt.unwrap();
  // HttpResponse::Ok().json(model)
}
