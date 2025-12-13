use crate::entities::prelude::*;
use crate::entities::{tb_region, tb_region::ActiveModel};
use sea_orm::*;

#[allow(dead_code)]
pub struct Mtn;
impl Mtn {
  pub async fn save_region(db: &DbConn, data: serde_json::Value) -> Result<tb_region::ActiveModel, DbErr> {
    let mut c: ActiveModel = Default::default();
    let seq = data.get("rg_seq");
    let mut data = data.clone();
    if seq == None {
      let v: serde_json::Value = 1i32.into();
      data["rg_seq"] = v;
    }
    c.set_from_json(data.clone()).unwrap();
    if seq == None {
      c.not_set(tb_region::Column::RgSeq);
    } else {
      let v = seq.unwrap().as_i64().unwrap() as i32;
      c.set(tb_region::Column::RgSeq, sea_orm::Value::Int(Some(v)));
    }
    c.save(db).await
  }

  pub async fn delete_region(db: &DbConn, seq: i32) -> Result<DeleteResult, DbErr> {
    let model: ActiveModel = TbRegion::find_by_id(seq)
      .one(db)
      .await?
      .ok_or(DbErr::Custom("Cannot find data.".to_owned()))
      .map(Into::into)?;

    model.delete(db).await
  }
}
