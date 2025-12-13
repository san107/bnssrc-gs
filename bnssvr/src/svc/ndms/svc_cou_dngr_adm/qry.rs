pub struct Qry;

use crate::entities::{prelude::*, tcm_cou_dngr_adm};
use sea_orm::*;

impl Qry {
  #[allow(dead_code)]
  pub async fn find_by_id(db: &DbConn, id: &str) -> Result<Option<tcm_cou_dngr_adm::Model>, DbErr> {
    TcmCouDngrAdm::find_by_id(id).one(db).await
  }

  pub async fn find_all(db: &DbConn) -> Result<Vec<tcm_cou_dngr_adm::Model>, DbErr> {
    TcmCouDngrAdm::find().all(db).await
  }
}
