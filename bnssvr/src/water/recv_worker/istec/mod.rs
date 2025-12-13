use crate::{entities::tb_water_hist, errf, svc::water::svc_water_hist};
use actix_web::web;
use sea_orm::TryIntoModel;
use sea_orm::*;

async fn _handle_istec_event(db: &DbConn, info: web::Json<serde_json::Value>) -> anyhow::Result<tb_water_hist::Model> {
  let obj = svc_water_hist::mtn::Mtn::save(&db, info.clone())
    .await
    .map_err(|e| errf!(e, "Save Error {info:?}"))?;

  let model = obj.try_into_model().unwrap();

  super::water_util::do_water_data_recv(&db, &model).await?;

  Ok(model)
}

pub async fn handle_istec_event(db: DbConn, info: web::Json<serde_json::Value>) -> anyhow::Result<tb_water_hist::Model> {
  let rslt = _handle_istec_event(&db, web::Json(info.clone())).await;
  if let Err(e) = rslt {
    log::error!("handle_istec_event error {:?} {info:?}", e);
    return Err(e);
  }
  rslt
  // let model = rslt.unwrap();

  // Ok(model)
}
