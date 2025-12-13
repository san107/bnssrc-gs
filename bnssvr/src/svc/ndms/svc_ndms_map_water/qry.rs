pub struct Qry;

use crate::entities::prelude::*;
use crate::entities::tb_ndms_map_water;
use crate::entities::tb_water;
use crate::entities::tcm_flud_wal;
use sea_orm::*;

impl Qry {
  #[allow(dead_code)]
  pub async fn find_by_id(db: &DbConn, key: (String, i32)) -> Result<Option<tb_ndms_map_water::Model>, DbErr> {
    TbNdmsMapWater::find_by_id(key).one(db).await
  }

  #[allow(dead_code)]
  pub async fn find_all(db: &DbConn) -> Result<Vec<tb_ndms_map_water::Model>, DbErr> {
    TbNdmsMapWater::find().all(db).await
  }

  pub async fn find_by_flcode(db: &DbConn, flcode: &str) -> Result<Vec<tb_ndms_map_water::Model>, DbErr> {
    TbNdmsMapWater::find()
      .filter(tb_ndms_map_water::Column::Flcode.eq(flcode))
      .all(db)
      .await
  }

  #[allow(dead_code)]
  pub async fn find_by_water_seq(db: &DbConn, seq: i32) -> Result<Vec<tcm_flud_wal::Model>, DbErr> {
    let mut select = TbNdmsMapWater::find().select_only();
    select = select.columns(tcm_flud_wal::Column::iter());

    select
      .join(JoinType::InnerJoin, tb_ndms_map_water::Relation::TcmFludWal.def())
      .filter(tb_ndms_map_water::Column::WaterSeq.eq(seq))
      .into_model::<tcm_flud_wal::Model>()
      .all(db)
      .await
  }

  #[allow(dead_code)]
  pub async fn find_by_water_dev_id(db: &DbConn, dev_id: &str) -> Result<Vec<tcm_flud_wal::Model>, DbErr> {
    let mut select = TbNdmsMapWater::find().select_only();
    select = select.columns(tcm_flud_wal::Column::iter());

    select
      .join(JoinType::InnerJoin, tb_ndms_map_water::Relation::TcmFludWal.def())
      .join(JoinType::InnerJoin, tb_ndms_map_water::Relation::TbWater.def())
      .filter(tb_water::Column::WaterDevId.eq(dev_id))
      .into_model::<tcm_flud_wal::Model>()
      .all(db)
      .await
  }
}
