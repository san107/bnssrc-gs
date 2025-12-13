pub struct Qry;

use crate::entities as ent;
use crate::entities::prelude::*;
use sea_orm::*;

impl Qry {
  #[allow(dead_code)]
  pub async fn find_by_id(db: &DbConn, _id: &str) -> Result<Option<ent::tb_alm_hist::Model>, DbErr> {
    let key = 1;
    TbAlmHist::find_by_id(key).one(db).await
  }
}
