pub struct Qry;

use crate::entities::tb_emcall_evt_hist;
use chrono::{DateTime, Local};
use sea_orm::*;

impl Qry {
  pub async fn find_by_list(
    db: &DbConn,
    emcall_id: &str,
    offset: u64,
    limit: Option<u64>,
  ) -> Result<Vec<tb_emcall_evt_hist::Model>, DbErr> {
    match limit {
      Some(limit) => {
        let mut q = tb_emcall_evt_hist::Entity::find()
          .filter(tb_emcall_evt_hist::Column::EmcallId.eq(emcall_id))
          .order_by(tb_emcall_evt_hist::Column::EmcallEvtDt, Order::Desc);
        sea_orm::QueryTrait::query(&mut q).offset(offset).limit(limit);
        q.all(db).await
      }
      None => {
        tb_emcall_evt_hist::Entity::find()
          .filter(tb_emcall_evt_hist::Column::EmcallId.eq(emcall_id))
          .order_by(tb_emcall_evt_hist::Column::EmcallEvtDt, Order::Desc)
          .all(db)
          .await
      }
    }
  }

  pub async fn find_by_range(
    db: &DbConn,
    emcall_id: &str,
    start: Option<DateTime<Local>>,
    end: Option<DateTime<Local>>,
  ) -> Result<Vec<tb_emcall_evt_hist::Model>, DbErr> {
    tb_emcall_evt_hist::Entity::find()
      .filter(tb_emcall_evt_hist::Column::EmcallId.eq(emcall_id))
      .filter(tb_emcall_evt_hist::Column::EmcallEvtDt.between(start, end))
      .order_by(tb_emcall_evt_hist::Column::EmcallEvtDt, Order::Asc)
      .all(db)
      .await
  }
}
