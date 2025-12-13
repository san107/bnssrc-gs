use crate::entities::prelude::*;
use crate::entities::{tcm_cou_dngr_almord, tcm_cou_dngr_almord::ActiveModel};
use log::debug;
use sea_orm::*;

#[allow(dead_code)]
pub struct Mtn;
impl Mtn {
  #[allow(dead_code)]
  pub async fn save(db: &DbConn, data: serde_json::Value) -> Result<tcm_cou_dngr_almord::Model, DbErr> {
    let model: tcm_cou_dngr_almord::Model = serde_json::from_value(data.clone()).unwrap();
    debug!("model {:?}", model);

    let key = (
      model.dscode.clone(),
      model.cd_dist_obsv.clone(),
      model.almcode.clone(),
      model.almde.clone(),
      model.almgb.clone(),
    );
    let c: ActiveModel = model.into();
    debug!("activemodel {:?}", c);

    match TcmCouDngrAlmord::find_by_id(key).one(db).await {
      Ok(Some(_ele)) => c.update(db).await,
      Ok(None) => c.insert(db).await,
      Err(e) => Err(e),
    }

    //c.save(db).await
  }

  #[allow(dead_code)]
  pub async fn delete(db: &DbConn, data: serde_json::Value) -> Result<DeleteResult, DbErr> {
    let model: tcm_cou_dngr_almord::Model = serde_json::from_value(data.clone()).unwrap();

    let key = (
      model.dscode.clone(),
      model.cd_dist_obsv.clone(),
      model.almcode.clone(),
      model.almde.clone(),
      model.almgb.clone(),
    );

    let model: ActiveModel = TcmCouDngrAlmord::find_by_id(key)
      .one(db)
      .await?
      .ok_or(DbErr::Custom("Cannot find data.".to_owned()))
      .map(Into::into)?;

    model.delete(db).await
  }
}
