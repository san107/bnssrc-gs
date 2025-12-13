pub struct Qry;

#[allow(unused_imports)]
pub use super::msg::Entity as Msg;
use super::msg::{self, Column};
use sea_orm::*;

impl Qry {
  #[allow(dead_code)]
  pub async fn find_by_id(db: &DbConn, seq: i32) -> Result<Option<msg::Model>, DbErr> {
    //Msg::find().filter(Column::Id.eq(seq)).all(db).await
    Msg::find_by_id(seq).one(db).await
  }

  #[allow(dead_code)]
  pub async fn find_by_id2(db: &DbConn, seq: i32) -> Result<Vec<msg::Model>, DbErr> {
    Msg::find().filter(Column::Id.eq(seq)).all(db).await
  }
}
