pub struct Qry;

use crate::entities::prelude::*;
use crate::entities::tb_ndms_map_ebrd;
use crate::entities::tcm_flud_board;
use sea_orm::*;

impl Qry {
  #[allow(dead_code)]
  pub async fn find_by_id(db: &DbConn, key: (String, i32)) -> Result<Option<tb_ndms_map_ebrd::Model>, DbErr> {
    TbNdmsMapEbrd::find_by_id(key).one(db).await
  }

  #[allow(dead_code)]
  pub async fn find_all(db: &DbConn) -> Result<Vec<tb_ndms_map_ebrd::Model>, DbErr> {
    TbNdmsMapEbrd::find().all(db).await
  }

  pub async fn find_by_flcode(db: &DbConn, flcode: &str) -> Result<Vec<tb_ndms_map_ebrd::Model>, DbErr> {
    TbNdmsMapEbrd::find()
      .filter(tb_ndms_map_ebrd::Column::Flcode.eq(flcode))
      .all(db)
      .await
  }

  pub async fn find_by_ebrd_seq(db: &DbConn, seq: i32) -> Result<Vec<tcm_flud_board::Model>, DbErr> {
    let mut select = TbNdmsMapEbrd::find().select_only();
    select = select.columns(tcm_flud_board::Column::iter());

    select
      .join(JoinType::InnerJoin, tb_ndms_map_ebrd::Relation::TcmFludBoard.def())
      .filter(tb_ndms_map_ebrd::Column::EbrdSeq.eq(seq))
      .into_model::<tcm_flud_board::Model>()
      .all(db)
      .await
  }
}
