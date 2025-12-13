#![allow(dead_code)]
pub struct Qry;

use crate::entities::prelude::*;
use crate::entities::tb_water;
use crate::entities::tb_water_grp;
use sea_orm::*;

impl Qry {
  #[allow(dead_code)]
  pub async fn find_by_water(db: &DbConn, seq: Option<i32>) -> Result<Vec<tb_water_grp::Model>, DbErr> {
    let mut qry = TbWaterGrp::find();
    if let Some(seq) = seq {
      qry = qry.filter(tb_water_grp::Column::WaterSeq.eq(seq));
    }

    qry.all(db).await
  }

  pub async fn find_lnks_by_water_seq(db: &DbConn, seq: i32) -> Result<Vec<i32>, DbErr> {
    TbWaterGrp::find()
      .select_only()
      .column(tb_water_grp::Column::LnkWaterSeq)
      .filter(tb_water_grp::Column::WaterSeq.eq(seq))
      .into_tuple::<i32>()
      .all(db)
      .await
  }

  pub async fn find_water_by_seq(db: &DbConn, seq: Option<i32>) -> Result<Vec<tb_water::Model>, DbErr> {
    let mut qry = TbWater::find();
    if let Some(seq) = seq {
      let subquery = TbWaterGrp::find()
        .select_only()
        .column(tb_water_grp::Column::LnkWaterSeq)
        .filter(tb_water_grp::Column::WaterSeq.eq(seq))
        .into_query();
      qry = qry.filter(tb_water::Column::WaterSeq.in_subquery(subquery));
    }

    qry.all(db).await
  }
  pub async fn find_water_by_seq_all(db: &DbConn, seq: i32) -> Result<Vec<tb_water::Model>, DbErr> {
    let mut qry = TbWater::find();

    let subquery = TbWaterGrp::find()
      .select_only()
      .column(tb_water_grp::Column::LnkWaterSeq)
      .filter(tb_water_grp::Column::WaterSeq.eq(seq))
      .into_query();
    qry = qry.filter(
      tb_water::Column::WaterSeq
        .in_subquery(subquery)
        .or(tb_water::Column::WaterSeq.eq(seq)),
    );
    qry = qry.order_by_asc(tb_water::Column::WaterSeq);

    qry.all(db).await
  }
}
