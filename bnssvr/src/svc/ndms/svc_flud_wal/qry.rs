pub struct Qry;

use crate::entities::prelude::*;
use crate::entities::tcm_flud_wal;
use sea_orm::*;

impl Qry {
  #[allow(dead_code)]
  pub async fn find_by_id(db: &DbConn, key: (String, i32)) -> Result<Option<tcm_flud_wal::Model>, DbErr> {
    TcmFludWal::find_by_id(key).one(db).await
  }

  pub async fn find_all(db: &DbConn) -> Result<Vec<tcm_flud_wal::Model>, DbErr> {
    TcmFludWal::find().all(db).await
  }

  pub async fn find_by_flcode(db: &DbConn, flcode: &str) -> Result<Vec<tcm_flud_wal::Model>, DbErr> {
    TcmFludWal::find()
      .filter(tcm_flud_wal::Column::Flcode.eq(flcode))
      .all(db)
      .await
  }
}
