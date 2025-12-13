#![allow(dead_code)]
use crate::entities::{prelude::*, tb_water_grp_stat};
use sea_orm::*;
pub struct Qry;

impl Qry {
  pub async fn find_by_id(db: &DbConn, water_grp_id: &str) -> Result<Option<tb_water_grp_stat::Model>, DbErr> {
    TbWaterGrpStat::find_by_id(water_grp_id).one(db).await
  }
}
