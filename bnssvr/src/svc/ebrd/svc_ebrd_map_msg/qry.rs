pub struct Qry;

use crate::entities::prelude::*;
use crate::entities::tb_ebrd_map_msg;
use crate::entities::tb_ebrd_msg;
use sea_orm::*;

impl Qry {
  pub async fn find_by_id(db: &DbConn, seq: i32, pos: i32) -> Result<Option<tb_ebrd_map_msg::Model>, DbErr> {
    TbEbrdMapMsg::find_by_id((seq, pos)).one(db).await
  }

  pub async fn find_cnt(db: &DbConn, seq: i32) -> Result<Option<(i32, i32)>, DbErr> {
    // TbEbrdMapMsg::find_by_id((seq, pos)).one(db).await

    let tot = TbEbrdMapMsg::find()
      .filter(tb_ebrd_map_msg::Column::EbrdSeq.eq(seq))
      .count(db)
      .await?;

    let send = TbEbrdMapMsg::find()
      .filter(tb_ebrd_map_msg::Column::EbrdSeq.eq(seq))
      .filter(tb_ebrd_map_msg::Column::SendStat.eq("Y"))
      .count(db)
      .await?;

    Ok(Some((tot as i32, send as i32)))
  }

  pub async fn find_msg_by_id(db: &DbConn, seq: i32, pos: i32) -> Result<Option<tb_ebrd_msg::Model>, DbErr> {
    let subquery = tb_ebrd_map_msg::Entity::find()
      .select_only()
      .column(tb_ebrd_map_msg::Column::EbrdMsgSeq)
      .filter(tb_ebrd_map_msg::Column::EbrdSeq.eq(seq))
      .filter(tb_ebrd_map_msg::Column::EbrdMsgPos.eq(pos))
      .into_query();

    TbEbrdMsg::find()
      .filter(tb_ebrd_msg::Column::EbrdMsgSeq.in_subquery(subquery))
      .one(db)
      .await
  }

  pub async fn find_by_msg_seq<C>(db: &C, ebrd_seq: i32, ebrd_msg_seq: i32) -> Result<Option<tb_ebrd_map_msg::Model>, DbErr>
  where
    C: ConnectionTrait,
  {
    //TbEbrdMapMsg::find_by_id((ebrd_seq, ebrd_msg_seq)).one(db).await
    TbEbrdMapMsg::find()
      .filter(tb_ebrd_map_msg::Column::EbrdSeq.eq(ebrd_seq))
      .filter(tb_ebrd_map_msg::Column::EbrdMsgSeq.eq(ebrd_msg_seq))
      .one(db)
      .await
      .map_or_else(|_| Ok(None), |r| Ok(r))
  }

  pub async fn find_pos_by_ebrd_seq<C>(db: &C, ebrd_seq: i32) -> Result<Vec<i32>, DbErr>
  where
    C: ConnectionTrait,
  {
    let maps: Vec<i32> = TbEbrdMapMsg::find()
      .select_only()
      .column(tb_ebrd_map_msg::Column::EbrdMsgPos)
      .filter(tb_ebrd_map_msg::Column::EbrdSeq.eq(ebrd_seq))
      .order_by_asc(tb_ebrd_map_msg::Column::EbrdMsgPos)
      .into_tuple::<i32>()
      .all(db)
      .await?;
    Ok(maps)
  }

  pub async fn find_all(db: &DbConn) -> Result<Vec<tb_ebrd_map_msg::Model>, DbErr> {
    TbEbrdMapMsg::find().all(db).await
  }
}
