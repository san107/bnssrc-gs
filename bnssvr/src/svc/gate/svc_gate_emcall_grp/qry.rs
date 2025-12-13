pub struct Qry;

use crate::entities::prelude::*;
use crate::entities::tb_emcall_grp;
use crate::entities::tb_gate_emcall_grp;
use sea_orm::*;

impl Qry {
  pub async fn find_by_gate_seq(db: &DbConn, seq: i32) -> Result<Vec<tb_gate_emcall_grp::Model>, DbErr> {
    TbGateEmcallGrp::find()
      .filter(tb_gate_emcall_grp::Column::GateSeq.eq(seq))
      .all(db)
      .await
  }

  pub async fn find_emcall_grp_by_gate_seq(db: &DbConn, seq: i32) -> Result<Vec<tb_emcall_grp::Model>, DbErr> {
    let sub = tb_gate_emcall_grp::Entity::find()
      .select_only()
      .column(tb_gate_emcall_grp::Column::EmcallGrpSeq)
      .filter(tb_gate_emcall_grp::Column::GateSeq.eq(seq))
      .into_query();

    TbEmcallGrp::find()
      .filter(tb_emcall_grp::Column::EmcallGrpSeq.in_subquery(sub))
      .all(db)
      .await
  }
}
