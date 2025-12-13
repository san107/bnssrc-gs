pub struct Qry;

use sea_orm::*;

use crate::entities as ent;
use crate::entities::prelude::*;

impl Qry {
  pub async fn find_by_id(db: &DbConn, id: i32) -> Result<Option<ent::tb_book_mark::Model>, DbErr> {
    TbBookMark::find_by_id(id).one(db).await
  }

  pub async fn find_all(db: &DbConn) -> Result<Vec<ent::tb_book_mark::Model>, DbErr> {
    TbBookMark::find().all(db).await
  }
}
