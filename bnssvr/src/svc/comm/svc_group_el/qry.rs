pub struct Qry;

use sea_orm::*;

use crate::entities::prelude::*;
use crate::entities::{self as ent};

impl Qry {
  pub async fn find_by_id(db: &DbConn, _id: i32) -> Result<Option<ent::tb_group_el::Model>, DbErr> {
    let key = (1, 1);
    TbGroupEl::find_by_id(key).one(db).await
  }

  // pub async fn find_all(db: &DbConn) -> Result<Vec<ent::tb_group_el::Model>, DbErr> {
  //   TbGroupEl::find().all(db).await
  // }

  // pub async fn find_by_grpid(db: &DbConn, grpid: i32) -> Result<Option<ent::tb_group_el::Model>, DbErr> {
  //   TbGroupEl::find().filter(tb_group_el::Column::GrpSeq.eq(grpid)).all(db).await
  // }

  pub async fn find_by_grpid(db: &DbConn, grpid: i32) -> Result<Vec<ent::tb_group_el::Model>, DbErr> {
    TbGroupEl::find()
      .filter(ent::tb_group_el::Column::GrpSeq.eq(grpid))
      .order_by(ent::tb_group_el::Column::GrpElSeq, Order::Asc)
      .all(db)
      .await
  }
}
