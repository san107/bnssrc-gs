use crate::entities::prelude::*;
use crate::entities::{tb_file_tmp, tb_file_tmp::ActiveModel};
use chrono::{DateTime, Local};
use sea_orm::*;

#[allow(dead_code)]
pub struct Mtn;
impl Mtn {
  #[allow(dead_code)]
  pub async fn save(db: &DbConn, file_seq: i32) -> Result<tb_file_tmp::ActiveModel, DbErr> {
    let mut c: ActiveModel = Default::default();
    let local: DateTime<Local> = Local::now();

    c.set(tb_file_tmp::Column::FileSeq, sea_orm::Value::Int(Some(file_seq)));
    c.set(
      tb_file_tmp::Column::UpdateDt,
      sea_orm::Value::ChronoDateTime(Some(Box::new(local.naive_local().into()))),
    );

    c.save(db).await
  }

  #[allow(dead_code)]
  pub async fn delete(db: &DbConn, seq: i32) -> Result<DeleteResult, DbErr> {
    let model: ActiveModel = TbFileTmp::find_by_id(seq)
      .one(db)
      .await?
      .ok_or(DbErr::Custom("Cannot find data.".to_owned()))
      .map(Into::into)?;

    model.delete(db).await
  }
}
