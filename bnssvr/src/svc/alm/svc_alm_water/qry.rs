pub struct Qry;

use crate::entities as ent;
use crate::entities::prelude::*;
use sea_orm::*;

impl Qry {
  #[allow(dead_code)]
  pub async fn find_by_id(db: &DbConn, seq: i32) -> Result<Option<ent::tb_alm_water::Model>, DbErr> {
    TbAlmWater::find_by_id(seq).one(db).await
  }
}
