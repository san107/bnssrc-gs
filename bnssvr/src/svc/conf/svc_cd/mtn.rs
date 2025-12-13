use crate::entities::prelude::*;
use crate::entities::{tb_cd, tb_cd::ActiveModel};
use log::debug;
use sea_orm::*;

#[allow(dead_code)]
pub struct Mtn;
impl Mtn {
  pub async fn save_cd(db: &DbConn, data: serde_json::Value) -> Result<tb_cd::Model, DbErr> {
    let mut c: ActiveModel = Default::default();
    let cd = data.get("cd");

    c.set_from_json(data.clone()).unwrap();

    let cd = cd.unwrap().as_str().unwrap();
    c.set(tb_cd::Column::Cd, sea_orm::Value::String(Some(Box::from(cd.to_owned()))));

    debug!("cd active model {:?}", c);

    match TbCd::find_by_id(cd).one(db).await {
      Ok(Some(_ele)) => c.update(db).await,
      Ok(None) => c.insert(db).await,
      Err(e) => Err(e),
    }

    //c.save(db).await
  }

  pub async fn delete_cd(db: &DbConn, id: &str) -> Result<DeleteResult, DbErr> {
    let model: ActiveModel = TbCd::find_by_id(id)
      .one(db)
      .await?
      .ok_or(DbErr::Custom("Cannot find data.".to_owned()))
      .map(Into::into)?;

    model.delete(db).await
  }
}
