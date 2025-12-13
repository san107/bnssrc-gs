use crate::entities::prelude::*;
use crate::entities::{tcm_flud_car_intrcp, tcm_flud_car_intrcp::ActiveModel};
use crate::ndms::ndms_model::NdmsGate;
use chrono::Local;
use sea_orm::*;

#[allow(dead_code)]
pub struct Mtn;
impl Mtn {
  #[allow(dead_code)]
  pub async fn save(db: &DbConn, data: serde_json::Value) -> Result<tcm_flud_car_intrcp::Model, DbErr> {
    let model: tcm_flud_car_intrcp::Model = serde_json::from_value(data.clone()).unwrap();

    let key = (model.flcode.clone(), model.cd_dist_intrcp.clone());

    let c: ActiveModel = model.into();
    let mut c = c.reset_all();
    c.updde = ActiveValue::Set(Local::now().naive_local());

    match TcmFludCarIntrcp::find_by_id(key).one(db).await {
      Ok(Some(_ele)) => c.update(db).await,
      Ok(None) => {
        c.rgsde = ActiveValue::Set(Local::now().naive_local());
        c.insert(db).await
      }
      Err(e) => Err(e),
    }

    //c.save(db).await
  }

  #[allow(dead_code)]
  pub async fn save_ndms_model(
    db: &DbConn,
    model: tcm_flud_car_intrcp::Model,
    data: &NdmsGate,
  ) -> Result<tcm_flud_car_intrcp::Model, DbErr> {
    let mut c: ActiveModel = model.into();
    if data.comm_sttus.is_some() {
      c.reset(tcm_flud_car_intrcp::Column::CommSttus);
    }
    if data.intrcp_sttus.is_some() {
      c.reset(tcm_flud_car_intrcp::Column::IntrcpSttus);
    }
    c.update(db).await
  }

  #[allow(dead_code)]
  pub async fn delete(db: &DbConn, data: serde_json::Value) -> Result<DeleteResult, DbErr> {
    let model: tcm_flud_car_intrcp::Model = serde_json::from_value(data.clone()).unwrap();

    let key = (model.flcode.clone(), model.cd_dist_intrcp.clone());

    let model: ActiveModel = TcmFludCarIntrcp::find_by_id(key)
      .one(db)
      .await?
      .ok_or(DbErr::Custom("Cannot find data.".to_owned()))
      .map(Into::into)?;

    model.delete(db).await
  }
}
