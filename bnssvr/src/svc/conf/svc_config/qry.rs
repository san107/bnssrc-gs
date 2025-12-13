pub struct Qry;

use sea_orm::*;

use crate::entities as ent;
use crate::entities::prelude::*;

impl Qry {
  pub async fn find_by_id(db: &DbConn, id: &str) -> Result<Option<ent::tb_config::Model>, DbErr> {
    TbConfig::find_by_id(id).one(db).await
  }
}
