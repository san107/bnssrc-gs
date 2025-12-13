pub struct Qry;

use sea_orm::*;

use crate::entities::prelude::*;
use crate::entities::tb_ebrd;
use crate::entities::tb_gate_ebrd;

impl Qry {
  pub async fn find_by_id(db: &DbConn, seq: i32) -> Result<Vec<tb_gate_ebrd::Model>, DbErr> {
    TbGateEbrd::find().filter(tb_gate_ebrd::Column::GateSeq.eq(seq)).all(db).await
  }

  pub async fn find_ebrd_by_gate_seq(db: &DbConn, seq: i32) -> Result<Vec<tb_ebrd::Model>, DbErr> {
    let sub = tb_gate_ebrd::Entity::find()
      .select_only()
      .column(tb_gate_ebrd::Column::EbrdSeq)
      .filter(tb_gate_ebrd::Column::GateSeq.eq(seq))
      .into_query();

    TbEbrd::find().filter(tb_ebrd::Column::EbrdSeq.in_subquery(sub)).all(db).await
  }
}
