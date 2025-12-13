pub struct Qry;

use crate::entities::prelude::*;
use crate::entities::tb_alm_sett;
use crate::entities::tb_alm_user;
use sea_orm::*;
use serde::Deserialize;
use serde::Serialize;

#[derive(FromQueryResult, Debug, Serialize, Deserialize)]
#[allow(dead_code)]
pub struct AlmSetInfo {
  pub water_seq: i32,
  pub alm_user_seq: i32,
  pub alm_user_nm: String,
  pub alm_user_mobile: String,
  pub sms_attn_yn: String,
  pub sms_warn_yn: String,
  pub sms_alert_yn: String,
  pub sms_crit_yn: String,
}

impl Qry {
  #[allow(dead_code)]
  pub async fn find_by_user(db: &DbConn, seq: i32) -> Result<Vec<tb_alm_sett::Model>, DbErr> {
    TbAlmSett::find()
      .filter(tb_alm_sett::Column::AlmUserSeq.eq(seq))
      .all(db)
      .await
  }

  #[allow(dead_code)]
  pub async fn find_by_water(db: &DbConn, seq: i32) -> Result<Vec<AlmSetInfo>, DbErr> {
    TbAlmSett::find()
      .column(tb_alm_user::Column::AlmUserNm)
      .column(tb_alm_user::Column::AlmUserMobile)
      .join(JoinType::InnerJoin, tb_alm_sett::Relation::TbAlmUser.def())
      .filter(tb_alm_sett::Column::WaterSeq.eq(seq))
      .into_model::<AlmSetInfo>()
      .all(db)
      .await
  }
}
