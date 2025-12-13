use crate::entities::prelude::*;
use crate::entities::{tcm_flud_wal, tcm_flud_wal::ActiveModel};
use sea_orm::*;

#[allow(dead_code)]
pub struct Mtn;
impl Mtn {
  #[allow(dead_code)]
  pub async fn save(db: &DbConn, data: serde_json::Value) -> Result<tcm_flud_wal::Model, DbErr> {
    let model: tcm_flud_wal::Model = serde_json::from_value(data.clone()).unwrap();

    let key = (model.flcode.clone(), model.cd_dist_wal.clone());

    let c: ActiveModel = model.into();
    match TcmFludWal::find_by_id(key).one(db).await {
      Ok(Some(_ele)) => c.update(db).await,
      Ok(None) => c.insert(db).await,
      Err(e) => Err(e),
    }

    //c.save(db).await
  }

  #[allow(dead_code)]
  pub async fn save_model(db: &DbConn, model: tcm_flud_wal::Model) -> Result<tcm_flud_wal::Model, DbErr> {
    let mut c: ActiveModel = model.into();

    c.reset(tcm_flud_wal::Column::LastColctDe);
    c.reset(tcm_flud_wal::Column::LastColctWal);
    c.update(db).await
    // match TcmFludWal::find_by_id(key).one(db).await {
    //   Ok(Some(_ele)) => c.update(db).await,
    //   Ok(None) => c.insert(db).await,
    //   Err(e) => Err(e),
    // }

    //c.save(db).await
  }

  #[allow(dead_code)]
  pub async fn delete(db: &DbConn, data: serde_json::Value) -> Result<DeleteResult, DbErr> {
    let model: tcm_flud_wal::Model = serde_json::from_value(data.clone()).unwrap();

    let key = (model.flcode.clone(), model.cd_dist_wal.clone());
    let model: ActiveModel = TcmFludWal::find_by_id(key)
      .one(db)
      .await?
      .ok_or(DbErr::Custom("Cannot find data.".to_owned()))
      .map(Into::into)?;

    model.delete(db).await
  }
}
