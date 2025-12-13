pub struct Qry;

use crate::entities::{prelude::*, tb_gate};
use crate::entities::{tb_water, tb_water_gate};
use sea_orm::Condition;
use sea_orm::*;
use sea_query::Expr;
use sea_query::Query;

impl Qry {
  #[allow(dead_code)]
  pub async fn find_by_water(db: &DbConn, seq: i32) -> Result<Vec<tb_water_gate::Model>, DbErr> {
    TbWaterGate::find()
      .filter(tb_water_gate::Column::WaterSeq.eq(seq))
      .all(db)
      .await
  }

  #[allow(dead_code)]
  pub async fn find_water_by_gate_seq(db: &DbConn, water_type: &str, gate_seq: i32) -> Result<Vec<tb_water::Model>, DbErr> {
    TbWater::find()
      .filter(
        Condition::any().add(
          tb_water::Column::WaterSeq.in_subquery(
            Query::select()
              .column(tb_water_gate::Column::WaterSeq)
              .from(tb_water_gate::Entity)
              .and_where(Expr::col(tb_water_gate::Column::GateSeq).eq(gate_seq))
              .order_by(tb_water_gate::Column::GateSeq, Order::Asc)
              .to_owned(),
          ),
        ),
      )
      .filter(tb_water::Column::WaterType.eq(water_type))
      .all(db)
      .await
  }

  pub async fn find_gate_by_water_seq(db: &DbConn, water_seq: i32) -> Result<Vec<tb_gate::Model>, DbErr> {
    TbGate::find()
      .filter(
        Condition::any().add(
          tb_gate::Column::GateSeq.in_subquery(
            Query::select()
              .column(tb_water_gate::Column::GateSeq)
              .from(tb_water_gate::Entity)
              .and_where(Expr::col(tb_water_gate::Column::WaterSeq).eq(water_seq))
              .order_by(tb_water_gate::Column::GateSeq, Order::Asc)
              .to_owned(),
          ),
        ),
      )
      .all(db)
      .await
  }

  pub async fn find_gate_by_water(db: &DbConn, seq: i32) -> Result<Vec<tb_gate::Model>, DbErr> {
    let mut select = TbWaterGate::find().select_only();
    select = select.columns(tb_gate::Column::iter());
    //select = select.column(tb_gate::Column::AutoDownCond);
    // for col in tb_gate::Column::iter() {
    //   select = select.column(col);
    // }
    select
      .join(JoinType::InnerJoin, tb_water_gate::Relation::TbGate.def())
      .filter(tb_water_gate::Column::WaterSeq.eq(seq))
      .into_model::<tb_gate::Model>()
      .all(db)
      .await
  }
}
