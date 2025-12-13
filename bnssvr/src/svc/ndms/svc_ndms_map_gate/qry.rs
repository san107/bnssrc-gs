pub struct Qry;

use crate::entities::prelude::*;
use crate::entities::tb_ndms_map_gate;
use crate::entities::tcm_flud_car_intrcp;
use sea_orm::*;

impl Qry {
  #[allow(dead_code)]
  pub async fn find_by_id(db: &DbConn, key: (String, i32)) -> Result<Option<tb_ndms_map_gate::Model>, DbErr> {
    TbNdmsMapGate::find_by_id(key).one(db).await
  }

  #[allow(dead_code)]
  pub async fn find_all(db: &DbConn) -> Result<Vec<tb_ndms_map_gate::Model>, DbErr> {
    TbNdmsMapGate::find().all(db).await
  }

  pub async fn find_by_flcode(db: &DbConn, flcode: &str) -> Result<Vec<tb_ndms_map_gate::Model>, DbErr> {
    TbNdmsMapGate::find()
      .filter(tb_ndms_map_gate::Column::Flcode.eq(flcode))
      .all(db)
      .await
  }

  pub async fn find_by_gate_seq(db: &DbConn, seq: i32) -> Result<Vec<tcm_flud_car_intrcp::Model>, DbErr> {
    let mut select = TbNdmsMapGate::find().select_only();
    select = select.columns(tcm_flud_car_intrcp::Column::iter());

    select
      .join(JoinType::InnerJoin, tb_ndms_map_gate::Relation::TcmFludCarIntrcp.def())
      .filter(tb_ndms_map_gate::Column::GateSeq.eq(seq))
      .into_model::<tcm_flud_car_intrcp::Model>()
      .all(db)
      .await
  }
}
