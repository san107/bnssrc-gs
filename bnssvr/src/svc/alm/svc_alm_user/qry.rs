pub struct Qry;

use crate::entities::prelude::*;
use crate::entities::tb_alm_user;
use sea_orm::*;

impl Qry {
  #[allow(dead_code)]
  pub async fn find_by_id(db: &DbConn, key: i32) -> Result<Option<tb_alm_user::Model>, DbErr> {
    TbAlmUser::find_by_id(key).one(db).await
  }

  pub async fn find_all(db: &DbConn) -> Result<Vec<tb_alm_user::Model>, DbErr> {
    TbAlmUser::find()
      //.order_by(tb_alm_user::Column::AlmUserSeq, Order::Desc)
      .order_by(tb_alm_user::Column::AlmUserNm, Order::Asc)
      .all(db)
      .await
  }
}
