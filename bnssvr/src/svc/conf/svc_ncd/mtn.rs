use crate::entities::prelude::*;
use crate::entities::{tb_ncd, tb_ncd::ActiveModel};
use log::debug;
use sea_orm::*;

#[allow(dead_code)]
pub struct Mtn;
#[allow(dead_code)]
impl Mtn {
  pub async fn save_cd(db: &DbConn, data: serde_json::Value) -> Result<tb_ncd::Model, DbErr> {
    let mut c: ActiveModel = Default::default();
    let ncd_id = data.get("ncd_id");
    let ncd_grp = data.get("ncd_grp");

    c.set_from_json(data.clone()).unwrap();

    let ncd_id = ncd_id.unwrap().as_i64().unwrap() as i32;
    let ncd_grp = ncd_grp.unwrap().as_str().unwrap();
    c.set(tb_ncd::Column::NcdId, sea_orm::Value::Int(Some(ncd_id)));
    c.set(
      tb_ncd::Column::NcdGrp,
      sea_orm::Value::String(Some(Box::from(ncd_grp.to_owned()))),
    );

    debug!("cd active model {:?}", c);

    match TbNcd::find_by_id((ncd_grp.to_owned(), ncd_id)).one(db).await {
      Ok(Some(_ele)) => c.update(db).await,
      Ok(None) => c.insert(db).await,
      Err(e) => Err(e),
    }

    //c.save(db).await
  }

  pub async fn delete_cd(db: &DbConn, grp: &str, id: i32) -> Result<DeleteResult, DbErr> {
    let key = (grp.to_owned(), id);
    let model: ActiveModel = TbNcd::find_by_id(key)
      .one(db)
      .await?
      .ok_or(DbErr::Custom("Cannot find data.".to_owned()))
      .map(Into::into)?;

    model.delete(db).await
  }
}
