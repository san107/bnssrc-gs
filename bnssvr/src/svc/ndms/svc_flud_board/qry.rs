pub struct Qry;

use crate::entities::{prelude::*, tcm_flud_board};
use sea_orm::*;

impl Qry {
  #[allow(dead_code)]
  pub async fn find_by_id(db: &DbConn, key: (String, i32)) -> Result<Option<tcm_flud_board::Model>, DbErr> {
    TcmFludBoard::find_by_id(key).one(db).await
  }

  pub async fn find_all(db: &DbConn) -> Result<Vec<tcm_flud_board::Model>, DbErr> {
    TcmFludBoard::find().all(db).await
  }

  pub async fn find_by_flcode(db: &DbConn, flcode: &str) -> Result<Vec<tcm_flud_board::Model>, DbErr> {
    TcmFludBoard::find()
      .filter(tcm_flud_board::Column::Flcode.eq(flcode))
      .all(db)
      .await
  }
}
