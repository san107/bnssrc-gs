pub struct Qry;

use crate::entities::prelude::*;
use crate::entities::tb_sys_conf;
use sea_orm::*;

impl Qry {
  pub async fn get_sys_conf(db: &DbConn) -> Result<Option<tb_sys_conf::Model>, DbErr> {
    TbSysConf::find_by_id("SYS").one(db).await
  }
}
