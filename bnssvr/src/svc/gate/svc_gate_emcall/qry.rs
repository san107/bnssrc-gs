pub struct Qry;

use crate::entities::prelude::*;
use crate::entities::tb_emcall;
use crate::entities::tb_gate_emcall;
use sea_orm::*;

impl Qry {
  pub async fn find_by_id(db: &DbConn, seq: i32) -> Result<Vec<tb_gate_emcall::Model>, DbErr> {
    TbGateEmcall::find()
      .filter(tb_gate_emcall::Column::GateSeq.eq(seq))
      .all(db)
      .await
  }

  pub async fn find_by_withemcall(db: &DbConn, seq: i32) -> Result<Vec<tb_emcall::Model>, DbErr> {
    let sub = tb_gate_emcall::Entity::find()
      .select_only()
      .column(tb_gate_emcall::Column::EmcallSeq)
      .filter(tb_gate_emcall::Column::GateSeq.eq(seq))
      .into_query();

    TbEmcall::find()
      .filter(tb_emcall::Column::EmcallSeq.in_subquery(sub))
      .all(db)
      .await
  }
}
