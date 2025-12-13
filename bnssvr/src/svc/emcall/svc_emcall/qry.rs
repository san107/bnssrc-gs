use crate::entities::tb_grp_tree;
use crate::entities::{prelude::*, tb_emcall};
use sea_orm::*;

pub struct Qry;

impl Qry {
  pub async fn find_by_id(db: &DbConn, id: i32) -> Result<Option<tb_emcall::Model>, DbErr> {
    TbEmcall::find_by_id(id).one(db).await
  }

  pub async fn find_by_emcall_id(db: &DbConn, emcall_id: &str) -> Result<Option<tb_emcall::Model>, DbErr> {
    TbEmcall::find()
      .filter(tb_emcall::Column::EmcallId.eq(emcall_id))
      .one(db)
      .await
  }

  pub async fn find_all(db: &DbConn, grp_id: &str) -> Result<Vec<tb_emcall::Model>, DbErr> {
    let sub_grp_id = tb_grp_tree::Entity::find()
      .select_only()
      .column(tb_grp_tree::Column::ChildId)
      .filter(tb_grp_tree::Column::ParentId.eq(grp_id))
      .into_query();

    TbEmcall::find()
      .filter(tb_emcall::Column::GrpId.in_subquery(sub_grp_id))
      .order_by(tb_emcall::Column::DispSeq, Order::Asc)
      .order_by(tb_emcall::Column::EmcallSeq, Order::Asc)
      .all(db)
      .await
  }

  pub async fn find_all_root(db: &DbConn) -> Result<Vec<tb_emcall::Model>, DbErr> {
    TbEmcall::find()
      .order_by(tb_emcall::Column::DispSeq, Order::Asc)
      .order_by(tb_emcall::Column::EmcallSeq, Order::Asc)
      .all(db)
      .await
  }
}
