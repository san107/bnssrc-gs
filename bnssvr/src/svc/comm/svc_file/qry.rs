pub struct Qry;
use crate::entities::{
  prelude::*,
  tb_file::{self},
};
use sea_orm::*;

impl Qry {
  #[allow(dead_code)]
  pub async fn find_by_id(db: &DbConn, id: i32) -> Result<Option<tb_file::Model>, DbErr> {
    TbFile::find_by_id(id).one(db).await
  }

  #[allow(dead_code)]
  pub async fn find_info_by_id(db: &DbConn, id: i32) -> Result<Option<JsonValue>, DbErr> {
    //TbFile::find_by_id(id).one(db).await
    TbFile::find()
      .select_only()
      .column(tb_file::Column::FileSeq)
      .column(tb_file::Column::FileNm)
      .column(tb_file::Column::FileSize)
      .filter(tb_file::Column::FileSeq.eq(id))
      .into_json()
      .one(db)
      .await
  }
}
