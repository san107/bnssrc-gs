pub struct Qry;

use crate::entities as ent;
use crate::entities::prelude::*;
use crate::entities::tb_gate_hist::{self};
use chrono::{DateTime, Local};
use sea_orm::*;
use sea_query::Expr;

impl Qry {
  #[allow(dead_code)]
  pub async fn find_by_id(db: &DbConn, id: i32) -> Result<Option<ent::tb_gate_hist::Model>, DbErr> {
    TbGateHist::find_by_id(id).one(db).await
  }

  #[allow(dead_code)]
  pub async fn find_all(db: &DbConn, limit: Option<u64>) -> Result<Vec<ent::tb_gate_hist::Model>, DbErr> {
    match limit {
      Some(limit) => {
        let mut q = TbGateHist::find().order_by(tb_gate_hist::Column::GateHistSeq, Order::Desc);
        sea_orm::QueryTrait::query(&mut q).offset(0).limit(limit);
        q.all(db).await
      }
      None => {
        TbGateHist::find()
          .order_by(tb_gate_hist::Column::GateHistSeq, Order::Desc)
          .all(db)
          .await
      }
    }
  }

  pub async fn find_by_range(
    db: &DbConn,
    gate_seq: i32,
    start: Option<DateTime<Local>>,
    end: Option<DateTime<Local>>,
  ) -> Result<Vec<ent::tb_gate_hist::Model>, DbErr> {
    TbGateHist::find()
      .filter(tb_gate_hist::Column::GateSeq.eq(gate_seq))
      .filter(tb_gate_hist::Column::UpdateDt.between(start, end))
      .order_by(tb_gate_hist::Column::GateHistSeq, Order::Asc)
      .all(db)
      .await
  }

  pub async fn find_by_month(
    db: &DbConn,
    gate_seq: i32,
    year_month: &str,
  ) -> Result<Vec<ent::tb_gate_hist::Model>, DbErr> {
    TbGateHist::find()
      .filter(tb_gate_hist::Column::GateSeq.eq(gate_seq))
      .filter(Expr::cust(format!("DATE_FORMAT(update_dt, '%Y-%m') = '{}'", year_month)))
      .order_by(tb_gate_hist::Column::UpdateDt, Order::Asc)
      .all(db)
      .await
  }

  #[allow(dead_code)]
  pub async fn find_by_list(
    db: &DbConn,
    seq: i32,
    offset: u64,
    limit: Option<u64>,
  ) -> Result<Vec<ent::tb_gate_hist::Model>, DbErr> {
    match limit {
      Some(limit) => {
        let mut q = TbGateHist::find()
          .filter(tb_gate_hist::Column::GateSeq.eq(seq))
          .order_by(tb_gate_hist::Column::GateHistSeq, Order::Desc);
        sea_orm::QueryTrait::query(&mut q).offset(offset).limit(limit);
        q.all(db).await
      }
      None => {
        TbGateHist::find()
          .filter(tb_gate_hist::Column::GateSeq.eq(seq))
          .order_by(tb_gate_hist::Column::GateHistSeq, Order::Desc)
          .all(db)
          .await
      }
    }
  }
}
