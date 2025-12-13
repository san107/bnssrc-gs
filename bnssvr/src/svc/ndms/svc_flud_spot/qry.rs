pub struct Qry;

use crate::entities::{prelude::*, tcm_flud_spot};
use sea_orm::*;

impl Qry {
  #[allow(dead_code)]
  pub async fn find_by_id(db: &DbConn, key: String) -> Result<Option<tcm_flud_spot::Model>, DbErr> {
    TcmFludSpot::find_by_id(key).one(db).await
  }

  pub async fn find_all(db: &DbConn) -> Result<Vec<tcm_flud_spot::Model>, DbErr> {
    TcmFludSpot::find().all(db).await
  }
}
