use crate::entities::tb_grp_tree;
use crate::entities::{prelude::*, tb_emcall_grp};
use sea_orm::*;

pub struct Qry;

impl Qry {
  pub async fn find_by_id(db: &DbConn, id: i32) -> Result<Option<tb_emcall_grp::Model>, DbErr> {
    TbEmcallGrp::find_by_id(id).one(db).await
  }

  pub async fn find_by_device_id(db: &DbConn, dev_id: &str) -> Result<Option<tb_emcall_grp::Model>, DbErr> {
    TbEmcallGrp::find()
      .filter(tb_emcall_grp::Column::EmcallGrpId.eq(dev_id))
      .one(db)
      .await
  }

  pub async fn find_all(db: &DbConn, grp_id: &str) -> Result<Vec<tb_emcall_grp::Model>, DbErr> {
    let sub_grp_id = tb_grp_tree::Entity::find()
      .select_only()
      .column(tb_grp_tree::Column::ChildId)
      .filter(tb_grp_tree::Column::ParentId.eq(grp_id))
      .into_query();

    TbEmcallGrp::find()
      .filter(tb_emcall_grp::Column::GrpId.in_subquery(sub_grp_id))
      .order_by(tb_emcall_grp::Column::DispSeq, Order::Asc)
      .order_by(tb_emcall_grp::Column::EmcallGrpSeq, Order::Asc)
      .all(db)
      .await
  }

  pub async fn find_all_root(db: &DbConn) -> Result<Vec<tb_emcall_grp::Model>, DbErr> {
    TbEmcallGrp::find()
      .order_by(tb_emcall_grp::Column::DispSeq, Order::Asc)
      .order_by(tb_emcall_grp::Column::EmcallGrpSeq, Order::Asc)
      .all(db)
      .await
  }
}
