use crate::entities::prelude::*;
use crate::entities::{tb_alm_sms_hist, tb_alm_sms_hist::ActiveModel};
use sea_orm::*;

#[allow(dead_code)]
pub struct Mtn;
impl Mtn {
  #[allow(dead_code)]
  pub async fn save(db: &DbConn, _data: serde_json::Value) -> Result<tb_alm_sms_hist::Model, DbErr> {
    let c: ActiveModel = Default::default();

    let key = 1;
    match TbAlmSmsHist::find_by_id(key).one(db).await {
      Ok(Some(_ele)) => c.update(db).await,
      Ok(None) => c.insert(db).await,
      Err(e) => Err(e),
    }

    //c.save(db).await
  }

  #[allow(dead_code)]
  pub async fn delete(db: &DbConn, _id: &str) -> Result<DeleteResult, DbErr> {
    let key = 1;
    let model: ActiveModel = TbAlmSmsHist::find_by_id(key)
      .one(db)
      .await?
      .ok_or(DbErr::Custom("Cannot find data.".to_owned()))
      .map(Into::into)?;

    model.delete(db).await
  }
}
