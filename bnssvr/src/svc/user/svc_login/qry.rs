pub struct Qry;

use sea_orm::*;

use crate::entities::prelude::*;
use crate::entities::{self, tb_login};
use crate::svc::svc_util;

impl Qry {
  pub async fn find_by_id(db: &DbConn, id: &str) -> Result<Option<entities::tb_login::Model>, DbErr> {
    TbLogin::find_by_id(id).one(db).await
  }

  pub async fn find_all(db: &DbConn, grpid: &str) -> Result<Vec<tb_login::Model>, DbErr> {
    let subquery = svc_util::subquery_grp_id(grpid);

    TbLogin::find()
      //.order_by(tb_alm_user::Column::AlmUserSeq, Order::Desc)
      .filter(tb_login::Column::GrpId.in_subquery(subquery))
      .order_by(tb_login::Column::UserId, Order::Asc)
      .all(db)
      .await
  }
}
