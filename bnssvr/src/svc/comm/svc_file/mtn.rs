use crate::entities::prelude::*;
use crate::entities::{tb_file, tb_file::ActiveModel};
use actix_multipart::form::bytes::Bytes;
use sea_orm::*;

#[allow(dead_code)]
pub struct Mtn;
impl Mtn {
  #[allow(dead_code)]
  pub async fn save<C>(db: &C, file_seq: Option<i32>, file: Bytes) -> Result<tb_file::ActiveModel, DbErr>
  where
    C: ConnectionTrait,
  {
    let mut c: ActiveModel = Default::default();

    if file_seq == None {
      c.not_set(tb_file::Column::FileSeq);
    } else {
      c.set(tb_file::Column::FileSeq, sea_orm::Value::Int(file_seq));
    }

    c.file_nm = Set(file.file_name.unwrap().to_owned());
    c.file_size = Set(file.data.len() as i32);
    c.file_data = Set(file.data.into());

    //log::info!("save file {:?}", c);

    c.save(db).await
  }

  #[allow(dead_code)]
  pub async fn delete(db: &DbConn, seq: i32) -> Result<DeleteResult, DbErr> {
    let model = TbFile::find_by_id(seq).one(db).await?;
    // .ok_or(DbErr::Custom("Cannot find data.".to_owned()))
    // .map(Into::into)?;

    if model.is_none() {
      let result = DeleteResult { rows_affected: 0 };
      return Ok(result);
    }
    let model = model.unwrap();

    model.delete(db).await
  }
}
