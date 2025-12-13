pub struct Qry;

use sea_orm::*;

use crate::entities::prelude::*;
use crate::entities::tb_grp;
use crate::entities::tb_grp_tree;

impl Qry {
  pub async fn find_by_id(db: &DbConn, id: &str) -> Result<Option<tb_grp::Model>, DbErr> {
    TbGrp::find_by_id(id).one(db).await
  }

  pub async fn find_all(db: &DbConn) -> Result<Vec<tb_grp::Model>, DbErr> {
    TbGrp::find().all(db).await
  }

  pub async fn exist_by_id(db: &DbConn, id: &str) -> Result<bool, DbErr> {
    TbGrp::find_by_id(id).count(db).await.map(|count| count > 0)
  }

  pub async fn find_by_childlist(db: &DbConn, grp_id: &str) -> Result<Vec<tb_grp::Model>, DbErr> {
    let sub_grp_id = tb_grp_tree::Entity::find()
      .select_only()
      .column(tb_grp_tree::Column::ChildId)
      .filter(tb_grp_tree::Column::ParentId.eq(grp_id))
      .into_query();

    TbGrp::find()
      .filter(tb_grp::Column::GrpId.in_subquery(sub_grp_id))
      .all(db)
      .await
  }
}
