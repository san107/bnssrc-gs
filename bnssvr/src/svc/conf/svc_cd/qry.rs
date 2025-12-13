pub struct Qry;

use crate::entities::prelude::*;
use crate::entities::tb_cd;
use sea_orm::*;

impl Qry {
  pub async fn find_by_id(db: &DbConn, id: &str) -> Result<Option<tb_cd::Model>, DbErr> {
    TbCd::find_by_id(id).one(db).await
  }

  pub async fn find_all(db: &DbConn) -> Result<Vec<tb_cd::Model>, DbErr> {
    TbCd::find()
      .order_by(tb_cd::Column::CdGrp, Order::Asc)
      .order_by(tb_cd::Column::CdSeq, Order::Asc)
      .all(db)
      .await
  }

  pub async fn find_by_grp_id(db: &DbConn, grp: &str, id: &str) -> Result<Vec<tb_cd::Model>, DbErr> {
    let mut q = TbCd::find().filter(tb_cd::Column::CdGrp.eq(grp).and(tb_cd::Column::CdId.eq(id)));
    sea_orm::QueryTrait::query(&mut q).offset(0).limit(1);

    q.all(db).await
  }

  pub async fn find_by_grp(db: &DbConn, grp: &str) -> Result<Vec<tb_cd::Model>, DbErr> {
    TbCd::find()
      .filter(tb_cd::Column::CdGrp.eq(grp))
      .order_by(tb_cd::Column::CdSeq, Order::Asc)
      .all(db)
      .await
  }
}
