use crate::entities::tb_grp_tree;
use sea_orm::*;

pub fn subquery_grp_id(grp_id: &str) -> sea_query::SelectStatement {
  let sub_grp_id = tb_grp_tree::Entity::find()
    .select_only()
    .column(tb_grp_tree::Column::ChildId)
    .filter(tb_grp_tree::Column::ParentId.eq(grp_id))
    .into_query();
  sub_grp_id
}
