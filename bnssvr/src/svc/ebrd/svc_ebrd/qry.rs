pub struct Qry;

use crate::entities::prelude::*;
use crate::entities::tb_ebrd;
use crate::entities::tb_ndms_map_ebrd;
use crate::svc::svc_util;
use sea_orm::*;

impl Qry {
  #[allow(dead_code)]
  pub async fn find_by_id(db: &DbConn, id: i32, grp_id: &str) -> Result<Option<tb_ebrd::Model>, DbErr> {
    let sub_grp_id = svc_util::subquery_grp_id(grp_id);

    TbEbrd::find()
      .filter(tb_ebrd::Column::GrpId.in_subquery(sub_grp_id))
      .filter(tb_ebrd::Column::EbrdSeq.eq(id))
      .one(db)
      .await
  }

  pub async fn find_by_id_root(db: &DbConn, id: i32) -> Result<Option<tb_ebrd::Model>, DbErr> {
    TbEbrd::find().filter(tb_ebrd::Column::EbrdSeq.eq(id)).one(db).await
  }

  pub async fn find_by_ebrd_id(db: &DbConn, ebrd_id: &str) -> Result<Option<tb_ebrd::Model>, DbErr> {
    TbEbrd::find().filter(tb_ebrd::Column::EbrdId.eq(ebrd_id)).one(db).await
  }

  pub async fn find_all(db: &DbConn, grp_id: &str) -> Result<Vec<tb_ebrd::Model>, DbErr> {
    let sub_grp_id = svc_util::subquery_grp_id(grp_id);

    TbEbrd::find()
      .filter(tb_ebrd::Column::GrpId.in_subquery(sub_grp_id))
      .order_by(tb_ebrd::Column::DispSeq, Order::Asc)
      .order_by(tb_ebrd::Column::EbrdSeq, Order::Asc)
      .all(db)
      .await
  }

  pub async fn find_all_root(db: &DbConn) -> Result<Vec<tb_ebrd::Model>, DbErr> {
    TbEbrd::find()
      .order_by(tb_ebrd::Column::DispSeq, Order::Asc)
      .order_by(tb_ebrd::Column::EbrdSeq, Order::Asc)
      .all(db)
      .await
  }

  pub async fn find_all_root_in_ndms(db: &DbConn) -> Result<Vec<tb_ebrd::Model>, DbErr> {
    let sub_ebrd_seq = tb_ndms_map_ebrd::Entity::find()
      .select_only()
      .column(tb_ndms_map_ebrd::Column::EbrdSeq)
      .into_query();

    TbEbrd::find()
      .filter(tb_ebrd::Column::EbrdSeq.in_subquery(sub_ebrd_seq))
      .order_by(tb_ebrd::Column::DispSeq, Order::Asc)
      .order_by(tb_ebrd::Column::EbrdSeq, Order::Asc)
      .all(db)
      .await
  }
}
