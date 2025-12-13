use crate::entities::prelude::*;
use crate::entities::{tcm_flud_spot, tcm_flud_spot::ActiveModel};
use chrono::Local;
use sea_orm::*;

#[allow(dead_code)]
pub struct Mtn;
impl Mtn {
  pub async fn save(db: &DbConn, data: serde_json::Value) -> Result<tcm_flud_spot::Model, DbErr> {
    let model: tcm_flud_spot::Model = serde_json::from_value(data.clone()).unwrap();

    let key = model.flcode.to_owned();

    let c: ActiveModel = model.into();
    let mut c = c.reset_all();
    c.updde = ActiveValue::Set(Local::now().naive_local());
    match TcmFludSpot::find_by_id(key).one(db).await {
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
  pub async fn delete(db: &DbConn, key: &str) -> Result<DeleteResult, DbErr> {
    let key = key.to_owned();
    let model: ActiveModel = TcmFludSpot::find_by_id(key)
      .one(db)
      .await?
      .ok_or(DbErr::Custom("Cannot find data.".to_owned()))
      .map(Into::into)?;

    model.delete(db).await
  }
}
