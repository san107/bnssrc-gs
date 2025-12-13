pub struct Qry;

use sea_orm::*;

use crate::entities as ent;
use crate::entities::prelude::*;
use sea_orm::Condition;
use sea_query::Expr;
use sea_query::Query;

impl Qry {
  pub async fn find_by_id(db: &DbConn, id: i32) -> Result<Option<ent::tb_group::Model>, DbErr> {
    TbGroup::find_by_id(id).one(db).await
  }

  // pub async fn find_all(db: &DbConn) -> Result<Vec<ent::tb_group::Model>, DbErr> {
  //   TbGroup::find().all(db).await
  // }

  pub async fn find_all(db: &DbConn, grp_id: &str) -> Result<Vec<ent::tb_group::Model>, DbErr> {
    let sub_grp_id = ent::tb_grp_tree::Entity::find()
      .select_only()
      .column(ent::tb_grp_tree::Column::ChildId)
      .filter(ent::tb_grp_tree::Column::ParentId.eq(grp_id))
      .into_query();

    TbGroup::find()
      .filter(ent::tb_group::Column::GrpId.in_subquery(sub_grp_id))
      .order_by(ent::tb_group::Column::GrpSeq, Order::Asc)
      .all(db)
      .await
  }

  pub async fn find_by_groupingate(db: &DbConn, seq: i32, grp_id: &str) -> Result<Vec<ent::tb_group::Model>, DbErr> {
    let sub_grp_id = ent::tb_grp_tree::Entity::find()
      .select_only()
      .column(ent::tb_grp_tree::Column::ChildId)
      .filter(ent::tb_grp_tree::Column::ParentId.eq(grp_id))
      .into_query();

    TbGroup::find()
      .filter(ent::tb_group::Column::GrpId.in_subquery(sub_grp_id))
      .filter(
        Condition::any().add(
          ent::tb_group::Column::GrpSeq.in_subquery(
            Query::select()
              .column(ent::tb_group_el::Column::GrpSeq)
              .from(ent::tb_group_el::Entity)
              .and_where(Expr::col(ent::tb_group_el::Column::GrpElSeq).eq(seq))
              .order_by(ent::tb_group_el::Column::GrpElSeq, Order::Asc)
              .to_owned(),
          ),
        ),
      )
      .all(db)
      .await
  }
}
