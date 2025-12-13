use crate::entities::tb_emcall_evt_hist;
use crate::entities::tb_emcall_evt_hist::ActiveModel;
use sea_orm::DbConn;
use sea_orm::*;

pub struct Mtn;

impl Mtn {
  pub async fn save(db: &DbConn, data: tb_emcall_evt_hist::Model) -> Result<tb_emcall_evt_hist::ActiveModel, DbErr> {
    let seq = data.emcall_evt_hist_seq;
    let mut e: ActiveModel = data.into();

    if seq < 0 {
      e.not_set(tb_emcall_evt_hist::Column::EmcallEvtHistSeq);
    }

    e.save(db).await
  }
}
