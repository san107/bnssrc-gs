pub struct Qry;

use crate::entities::prelude::*;
use crate::entities::tcm_cou_dngr_almord;
use sea_orm::*;

impl Qry {
  pub async fn find_by_id(
    db: &DbConn,
    key: (String, i32, String, String, String),
  ) -> Result<Option<tcm_cou_dngr_almord::Model>, DbErr> {
    TcmCouDngrAlmord::find_by_id(key).one(db).await
  }

  pub async fn find_all(db: &DbConn) -> Result<Vec<tcm_cou_dngr_almord::Model>, DbErr> {
    TcmCouDngrAlmord::find().all(db).await
  }
}
