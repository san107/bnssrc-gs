pub struct Qry;

use crate::entities::tb_camera::{self};
use crate::entities::{self as ent, tb_gate, tb_grp_tree};
use crate::entities::{prelude::*, tb_water_gate};
use sea_orm::*;

impl Qry {
  pub async fn find_by_id(db: &DbConn, id: i32) -> Result<Option<ent::tb_camera::Model>, DbErr> {
    TbCamera::find_by_id(id).one(db).await
  }

  pub async fn find_by_grp_id(db: &DbConn, id: String) -> Result<Vec<ent::tb_camera::Model>, DbErr> {
    TbCamera::find()
      .filter(tb_camera::Column::GrpId.contains(id))
      .order_by(tb_camera::Column::CamSeq, Order::Asc)
      .all(db)
      .await
  }

  pub async fn find_by_childlist(db: &DbConn, grp_id: &str) -> Result<Vec<ent::tb_camera::Model>, DbErr> {
    let sub_grp_id = tb_grp_tree::Entity::find()
      .select_only()
      .column(tb_grp_tree::Column::ChildId)
      .filter(tb_grp_tree::Column::ParentId.eq(grp_id))
      .into_query();

    TbCamera::find()
      .filter(tb_camera::Column::GrpId.in_subquery(sub_grp_id))
      .order_by(tb_camera::Column::DispSeq, Order::Asc)
      .order_by(tb_camera::Column::CamSeq, Order::Asc)
      .all(db)
      .await
  }

  pub async fn find_all(db: &DbConn) -> Result<Vec<ent::tb_camera::Model>, DbErr> {
    TbCamera::find()
      .order_by(tb_camera::Column::DispSeq, Order::Asc)
      .order_by(tb_camera::Column::CamSeq, Order::Asc)
      .all(db)
      .await
  }

  pub async fn find_by_water(db: &DbConn, water_seq: i32) -> Result<Vec<ent::tb_camera::Model>, DbErr> {
    TbWaterGate::find()
      .select_only()
      .columns(tb_camera::Column::iter())
      .join(JoinType::InnerJoin, tb_water_gate::Relation::TbGate.def())
      .join(JoinType::InnerJoin, tb_gate::Relation::TbCamera.def())
      .filter(tb_water_gate::Column::WaterSeq.eq(water_seq))
      .into_model::<tb_camera::Model>()
      .all(db)
      .await
  }

  #[allow(dead_code)]
  pub async fn find_by_name(
    db: &DbConn,
    search: String,
    offset: u64,
    limit: Option<u64>,
  ) -> Result<Vec<ent::tb_camera::Model>, DbErr> {
    match limit {
      Some(limit) => {
        let mut q = TbCamera::find()
          .filter(tb_camera::Column::CamNm.contains(search))
          .order_by(tb_camera::Column::CamSeq, Order::Asc);
        sea_orm::QueryTrait::query(&mut q).offset(offset).limit(limit);
        q.all(db).await
      }
      None => {
        TbCamera::find()
          .filter(tb_camera::Column::CamNm.contains(search))
          .order_by(tb_camera::Column::CamSeq, Order::Asc)
          .all(db)
          .await
      }
    }
  }
}
