pub struct Qry;

use crate::entities as ent;
use crate::entities::prelude::*;
use crate::entities::tb_gate_camera::{self};
use sea_orm::Condition;
use sea_orm::*;
use sea_query::Expr;
use sea_query::Query;

impl Qry {
  #[allow(dead_code)]
  pub async fn find_by_id(db: &DbConn, seq: i32) -> Result<Vec<ent::tb_gate_camera::Model>, DbErr> {
    TbGateCamera::find()
      .filter(tb_gate_camera::Column::GateSeq.eq(seq))
      .all(db)
      .await
  }

  pub async fn find_by_withcam(db: &DbConn, seq: i32) -> Result<Vec<ent::tb_camera::Model>, DbErr> {
    TbCamera::find()
      .filter(
        Condition::any().add(
          ent::tb_camera::Column::CamSeq.in_subquery(
            Query::select()
              .column(ent::tb_gate_camera::Column::CamSeq)
              .from(ent::tb_gate_camera::Entity)
              .and_where(Expr::col(ent::tb_gate_camera::Column::GateSeq).eq(seq))
              .order_by(ent::tb_gate_camera::Column::CamSeq, Order::Asc)
              .to_owned(),
          ),
        ),
      )
      .all(db)
      .await
  }
}
