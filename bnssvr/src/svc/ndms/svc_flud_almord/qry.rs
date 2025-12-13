pub struct Qry;

use crate::entities::prelude::*;
use crate::entities::{self as ent, tcm_flud_almord};
use sea_orm::*;

impl Qry {
  pub async fn find_by_id(db: &DbConn, key: (String, i32, String, String)) -> Result<Option<ent::tcm_flud_almord::Model>, DbErr> {
    TcmFludAlmord::find_by_id(key).one(db).await
  }

  pub async fn find_all(db: &DbConn) -> Result<Vec<tcm_flud_almord::Model>, DbErr> {
    TcmFludAlmord::find().all(db).await
  }
}
