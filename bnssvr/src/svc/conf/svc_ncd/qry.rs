pub struct Qry;

use crate::entities::prelude::*;
use crate::entities::tb_ncd;
use sea_orm::*;

#[allow(dead_code)]
impl Qry {
  pub async fn find_by_id(db: &DbConn, grp: &str, id: i32) -> Result<Option<tb_ncd::Model>, DbErr> {
    let key = (grp.to_owned(), id);
    TbNcd::find_by_id(key).one(db).await
  }

  pub async fn find_all(db: &DbConn) -> Result<Vec<tb_ncd::Model>, DbErr> {
    TbNcd::find()
      .order_by(tb_ncd::Column::NcdGrp, Order::Asc)
      .order_by(tb_ncd::Column::NcdSeq, Order::Asc)
      .all(db)
      .await
  }

  pub async fn find_by_grp_id(db: &DbConn, grp: &str, id: &str) -> Result<Vec<tb_ncd::Model>, DbErr> {
    let mut q = TbNcd::find().filter(tb_ncd::Column::NcdGrp.eq(grp).and(tb_ncd::Column::NcdId.eq(id)));
    sea_orm::QueryTrait::query(&mut q).offset(0).limit(1);

    q.all(db).await
  }

  pub async fn find_by_grp(db: &DbConn, grp: &str) -> Result<Vec<tb_ncd::Model>, DbErr> {
    TbNcd::find()
      .filter(tb_ncd::Column::NcdGrp.eq(grp))
      .order_by(tb_ncd::Column::NcdSeq, Order::Asc)
      .all(db)
      .await
  }
}
