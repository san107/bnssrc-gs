pub struct Qry;

use crate::entities::prelude::*;
use crate::entities::tb_grp_tree;
use sea_orm::prelude::Expr;
use sea_orm::sea_query::SimpleExpr;
use sea_orm::*;
use serde::Deserialize;
use serde::Serialize;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, FromQueryResult)]
pub struct GrpTree {
  pub parent_id: String,
  pub child_id: String,
  pub grp_depth: i32,
}

impl Qry {
  pub async fn find_by_id(db: &DbConn, parent_id: &str, child_id: &str) -> Result<Option<GrpTree>, DbErr> {
    let b = true;
    if b {
      let expr = Qry::expr_grp_depth();

      return TbGrpTree::find_by_id((parent_id.to_owned(), child_id.to_owned()))
        .select_only()
        .column(tb_grp_tree::Column::ChildId)
        .column(tb_grp_tree::Column::ParentId)
        .column_as(expr, "grp_depth")
        .into_model::<GrpTree>()
        .one(db)
        .await;
    }
    let grp_depth = TbGrpTree::find()
      .filter(tb_grp_tree::Column::ChildId.eq(child_id))
      .count(db)
      .await?;

    TbGrpTree::find_by_id((parent_id.to_owned(), child_id.to_owned()))
      .one(db)
      .await
      .map(|r| {
        r.map(|r| GrpTree {
          parent_id: r.parent_id,
          child_id: r.child_id,
          grp_depth: grp_depth as i32,
        })
      })
  }

  fn expr_grp_depth() -> SimpleExpr {
    let v: Vec<i32> = vec![];
    Expr::cust_with_values(
      "(SELECT COUNT(*) FROM tb_grp_tree t2 WHERE t2.child_id = tb_grp_tree.child_id)",
      v,
    )
  }

  pub async fn find_all(db: &DbConn) -> Result<Vec<GrpTree>, DbErr> {
    //TbGrpTree::find().all(db).await
    //let expr2 = Expr::cust_with_values("CASE WHEN age >= ? THEN 'adult' ELSE 'minor' END", vec![18]);

    let expr = Qry::expr_grp_depth();

    TbGrpTree::find()
      .select_only()
      .column(tb_grp_tree::Column::ChildId)
      .column(tb_grp_tree::Column::ParentId)
      .column_as(expr, "grp_depth")
      .into_model::<GrpTree>()
      .all(db)
      .await
  }

  pub async fn find_by_parent(db: &DbConn, parent_id: &str) -> Result<Vec<tb_grp_tree::Model>, DbErr> {
    TbGrpTree::find()
      .filter(tb_grp_tree::Column::ParentId.eq(parent_id))
      //.order_by(tb_grp_tree::Column::GrpDepth, Order::Asc)
      .all(db)
      .await

    // let expr = Qry::expr_grp_depth();
    // TbGrpTree::find()
    //   .filter(tb_grp_tree::Column::ParentId.eq(parent_id))
    //   .select_only()
    //   .column(tb_grp_tree::Column::ChildId)
    //   .column(tb_grp_tree::Column::ParentId)
    //   .column_as(expr, "grp_depth")
    //   .into_model::<GrpTree>()
    //   .all(db)
    //   .await
  }

  pub async fn count_by_parent(db: &DbConn, parent_id: &str) -> Result<u64, DbErr> {
    TbGrpTree::find()
      .filter(tb_grp_tree::Column::ParentId.eq(parent_id))
      .count(db)
      .await
  }

  pub async fn exist_by_id(db: &DbConn, parent_id: &str, child_id: &str) -> Result<bool, DbErr> {
    TbGrpTree::find_by_id((parent_id.to_owned(), child_id.to_owned()))
      .count(db)
      .await
      .map(|count| count > 0)
  }

  pub async fn find_by_child<C>(db: &C, child_id: &str) -> Result<Vec<tb_grp_tree::Model>, DbErr>
  where
    C: ConnectionTrait,
  {
    TbGrpTree::find()
      .filter(tb_grp_tree::Column::ChildId.eq(child_id))
      //.order_by(tb_grp_tree::Column::GrpDepth, Order::Asc)
      .all(db)
      .await
  }
}
