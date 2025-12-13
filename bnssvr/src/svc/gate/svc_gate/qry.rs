pub struct Qry;

use sea_orm::*;

use crate::entities::prelude::*;
use crate::entities::tb_gate::{self};
use crate::entities::{self as ent, tb_grp_tree};
use sea_orm::Condition;
use sea_query::Expr;
use sea_query::Query;

impl Qry {
  pub async fn find_by_id(db: &DbConn, id: i32) -> Result<Option<ent::tb_gate::Model>, DbErr> {
    TbGate::find_by_id(id).one(db).await
  }

  pub async fn find_by_grp_id(db: &DbConn, id: String) -> Result<Vec<ent::tb_gate::Model>, DbErr> {
    TbGate::find()
      .filter(tb_gate::Column::GrpId.contains(id))
      .order_by(tb_gate::Column::GateSeq, Order::Asc)
      .all(db)
      .await
  }

  pub async fn find_by_childlist(db: &DbConn, grp_id: &str) -> Result<Vec<ent::tb_gate::Model>, DbErr> {
    let sub_grp_id = tb_grp_tree::Entity::find()
      .select_only()
      .column(tb_grp_tree::Column::ChildId)
      .filter(tb_grp_tree::Column::ParentId.eq(grp_id))
      .into_query();

    TbGate::find()
      .filter(tb_gate::Column::GrpId.in_subquery(sub_grp_id))
      .order_by(tb_gate::Column::DispSeq, Order::Asc)
      .order_by(tb_gate::Column::GateSeq, Order::Asc)
      .all(db)
      .await
  }

  pub async fn find_all(db: &DbConn) -> Result<Vec<ent::tb_gate::Model>, DbErr> {
    TbGate::find()
      .order_by(tb_gate::Column::DispSeq, Order::Asc)
      .order_by(tb_gate::Column::GateSeq, Order::Asc)
      .all(db)
      .await
  }

  #[allow(dead_code)]
  pub async fn find_by_name(
    db: &DbConn,
    search: String,
    offset: u64,
    limit: Option<u64>,
  ) -> Result<Vec<ent::tb_gate::Model>, DbErr> {
    match limit {
      Some(limit) => {
        let mut q = TbGate::find()
          .filter(tb_gate::Column::GateNm.contains(search))
          .order_by(tb_gate::Column::GateSeq, Order::Asc);
        sea_orm::QueryTrait::query(&mut q).offset(offset).limit(limit);
        q.all(db).await
      }
      None => {
        TbGate::find()
          .filter(tb_gate::Column::GateNm.contains(search))
          .order_by(tb_gate::Column::GateSeq, Order::Asc)
          .all(db)
          .await
      }
    }
  }

  pub async fn find_by_withgrp(db: &DbConn, grpid: i32) -> Result<Vec<ent::tb_gate::Model>, DbErr> {
    TbGate::find()
      .filter(
        Condition::any().add(
          ent::tb_gate::Column::GateSeq.in_subquery(
            Query::select()
              .column(ent::tb_group_el::Column::GrpElSeq)
              .from(ent::tb_group_el::Entity)
              // .expr(ent::tb_group_el::Column::GrpSeq.eq(grpid))
              .and_where(Expr::col(ent::tb_group_el::Column::GrpSeq).eq(grpid))
              .order_by(ent::tb_group_el::Column::GrpElSeq, Order::Asc)
              .to_owned(),
          ),
        ),
      )
      .order_by(tb_gate::Column::DispSeq, Order::Asc)
      .order_by(tb_gate::Column::GateSeq, Order::Asc)
      .all(db)
      .await
  }

  pub async fn find_by_withnotgrp(db: &DbConn) -> Result<Vec<ent::tb_gate::Model>, DbErr> {
    TbGate::find()
      .filter(
        Condition::any().add(
          ent::tb_gate::Column::GateSeq.not_in_subquery(
            Query::select()
              .column(ent::tb_group_el::Column::GrpElSeq)
              .from(ent::tb_group_el::Entity)
              .add_group_by(vec![Expr::col(ent::tb_group_el::Column::GrpElSeq).into()])
              .order_by(ent::tb_group_el::Column::GrpElSeq, Order::Asc)
              .to_owned(),
          ),
        ),
      )
      .order_by(tb_gate::Column::DispSeq, Order::Asc)
      .order_by(tb_gate::Column::GateSeq, Order::Asc)
      .all(db)
      .await
  }
}
