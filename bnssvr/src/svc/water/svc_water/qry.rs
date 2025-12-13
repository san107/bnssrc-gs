pub struct Qry;

use crate::entities::{self as ent, tb_water};
use crate::entities::{prelude::*, tb_grp_tree};
use sea_orm::*;

impl Qry {
  pub async fn find_by_id(db: &DbConn, id: i32) -> Result<Option<ent::tb_water::Model>, DbErr> {
    TbWater::find_by_id(id).one(db).await
  }

  pub async fn max_water_id(db: &DbConn, water_type: &str) -> Result<Option<ent::tb_water::Model>, DbErr> {
    TbWater::find()
      .filter(tb_water::Column::WaterType.eq(water_type))
      .order_by_desc(tb_water::Column::WaterDevId)
      .limit(1)
      .one(db)
      .await
  }

  pub async fn find_by_water_gate_seq(db: &DbConn, water_type: &str, gate_seq: i32) -> Result<Vec<ent::tb_water::Model>, DbErr> {
    TbWater::find()
      .filter(tb_water::Column::WaterType.eq(water_type))
      .filter(tb_water::Column::WaterGateSeq.eq(gate_seq))
      .order_by(tb_water::Column::WaterSeq, Order::Asc)
      .all(db)
      .await
  }

  pub async fn find_by_grp_id(db: &DbConn, id: String) -> Result<Vec<ent::tb_water::Model>, DbErr> {
    TbWater::find()
      .filter(tb_water::Column::GrpId.contains(id))
      .order_by(tb_water::Column::WaterSeq, Order::Asc)
      .all(db)
      .await
  }

  pub async fn find_by_childlist(db: &DbConn, grp_id: &str) -> Result<Vec<ent::tb_water::Model>, DbErr> {
    let sub_grp_id = tb_grp_tree::Entity::find()
      .select_only()
      .column(tb_grp_tree::Column::ChildId)
      .filter(tb_grp_tree::Column::ParentId.eq(grp_id))
      .into_query();

    TbWater::find()
      .filter(tb_water::Column::GrpId.in_subquery(sub_grp_id))
      .order_by(tb_water::Column::DispSeq, Order::Asc)
      .order_by(tb_water::Column::WaterSeq, Order::Asc)
      .all(db)
      .await
  }

  #[allow(dead_code)]
  pub async fn find_by_devid(db: &DbConn, devid: &str) -> Result<Option<ent::tb_water::Model>, DbErr> {
    TbWater::find().filter(tb_water::Column::WaterDevId.eq(devid)).one(db).await
  }

  pub async fn find_all(db: &DbConn) -> Result<Vec<ent::tb_water::Model>, DbErr> {
    TbWater::find()
      .order_by(tb_water::Column::DispSeq, Order::Asc)
      .order_by(tb_water::Column::WaterSeq, Order::Asc)
      .all(db)
      .await
  }

  #[allow(dead_code)]
  pub async fn find_by_name(
    db: &DbConn,
    search: String,
    offset: u64,
    limit: Option<u64>,
  ) -> Result<Vec<ent::tb_water::Model>, DbErr> {
    match limit {
      Some(limit) => {
        let mut q = TbWater::find()
          .filter(tb_water::Column::WaterNm.contains(search))
          .order_by(tb_water::Column::WaterSeq, Order::Asc);
        sea_orm::QueryTrait::query(&mut q).offset(offset).limit(limit);
        q.all(db).await
      }
      None => {
        TbWater::find()
          .filter(tb_water::Column::WaterNm.contains(search))
          .order_by(tb_water::Column::WaterSeq, Order::Asc)
          .all(db)
          .await
      }
    }
  }
}
