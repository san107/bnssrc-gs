pub struct Qry;

use crate::entities::prelude::*;
use crate::entities::tb_ebrd_map_msg;
use crate::entities::tb_ebrd_msg;
use chrono::Local;
use chrono::NaiveDateTime;
use sea_orm::*;
use serde::Deserialize;
use serde::Serialize;

/**
 pub ebrd_msg_seq: i32,
 pub ebrd_size_w: i32,
 pub ebrd_size_h: i32,
 pub ebrd_msg_text: String,
 pub ebrd_msg_html: String,
 pub ebrd_msg_type: String,
 pub emerg_yn: String,
 pub sound_yn: String,
 pub file_seq: i32,
 pub start_dt: String,
 pub end_dt: String,
 pub start_efct: i32,
 pub end_efct: i32,
 pub start_spd: i32,
 pub end_spd: i32,
 pub start_wait_time: i32,
 pub repeat_cnt: i32,
 pub update_user_id: String,
 pub update_dt: DateTime,

 // tb_ebrd_map_msg
  pub ebrd_seq: i32,
 #[sea_orm(primary_key, auto_increment = false)]
 pub ebrd_msg_pos: i32,
 pub ebrd_msg_seq: i32,
 pub send_stat: String,
 pub send_rslt: String,
 pub send_dt: Option<DateTime>,
*/

#[derive(FromQueryResult, Debug, Serialize, Deserialize)]
pub struct EbrdMsgInfo {
  pub ebrd_msg_seq: i32,
  pub ebrd_size_w: i32,
  pub ebrd_size_h: i32,
  pub ebrd_msg_text: String,
  pub ebrd_msg_html: String,
  pub ebrd_msg_type: String,
  pub emerg_yn: String,
  pub sound_yn: String,
  pub file_seq: i32,
  pub start_dt: String,
  pub end_dt: String,
  pub start_efct: i32,
  pub end_efct: i32,
  pub start_spd: i32,
  pub end_spd: i32,
  pub start_wait_time: i32,
  pub repeat_cnt: i32,
  pub update_user_id: String,
  pub update_dt: NaiveDateTime,

  pub ebrd_seq: i32,
  pub ebrd_msg_pos: i32,
  pub send_stat: String,
  pub send_rslt: String,
  pub send_dt: Option<NaiveDateTime>,
}

impl Qry {
  #[allow(dead_code)]
  pub async fn find_by_id(db: &DbConn, seq: i32) -> Result<Option<tb_ebrd_msg::Model>, DbErr> {
    TbEbrdMsg::find()
      .filter(tb_ebrd_msg::Column::EbrdMsgSeq.eq(seq))
      .one(db)
      .await
  }

  fn get_query() -> Select<tb_ebrd_msg::Entity> {
    TbEbrdMsg::find()
      .select_only()
      .column_as(tb_ebrd_msg::Column::EbrdMsgSeq, "ebrd_msg_seq")
      .column_as(tb_ebrd_msg::Column::EbrdSizeW, "ebrd_size_w")
      .column_as(tb_ebrd_msg::Column::EbrdSizeH, "ebrd_size_h")
      .column_as(tb_ebrd_msg::Column::EbrdMsgText, "ebrd_msg_text")
      .column_as(tb_ebrd_msg::Column::EbrdMsgHtml, "ebrd_msg_html")
      .column_as(tb_ebrd_msg::Column::EbrdMsgType, "ebrd_msg_type")
      .column_as(tb_ebrd_msg::Column::EmergYn, "emerg_yn")
      .column_as(tb_ebrd_msg::Column::SoundYn, "sound_yn")
      .column_as(tb_ebrd_msg::Column::FileSeq, "file_seq")
      .column_as(tb_ebrd_msg::Column::StartDt, "start_dt")
      .column_as(tb_ebrd_msg::Column::EndDt, "end_dt")
      .column_as(tb_ebrd_msg::Column::StartEfct, "start_efct")
      .column_as(tb_ebrd_msg::Column::EndEfct, "end_efct")
      .column_as(tb_ebrd_msg::Column::StartSpd, "start_spd")
      .column_as(tb_ebrd_msg::Column::EndSpd, "end_spd")
      .column_as(tb_ebrd_msg::Column::StartWaitTime, "start_wait_time")
      .column_as(tb_ebrd_msg::Column::RepeatCnt, "repeat_cnt")
      .column_as(tb_ebrd_msg::Column::UpdateUserId, "update_user_id")
      .column_as(tb_ebrd_msg::Column::UpdateDt, "update_dt")
      .column_as(tb_ebrd_map_msg::Column::EbrdSeq, "ebrd_seq")
      .column_as(tb_ebrd_map_msg::Column::EbrdMsgPos, "ebrd_msg_pos")
      .column_as(tb_ebrd_map_msg::Column::SendStat, "send_stat")
      .column_as(tb_ebrd_map_msg::Column::SendRslt, "send_rslt")
      .column_as(tb_ebrd_map_msg::Column::SendDt, "send_dt")
      .inner_join(tb_ebrd_map_msg::Entity)
  }

  pub async fn find_all(db: &DbConn, ebrd_seq: i32, running: bool, page: Option<u64>) -> Result<Vec<EbrdMsgInfo>, DbErr> {
    let mut query = Self::get_query();

    let mut filter = Condition::all();
    filter = filter.add(tb_ebrd_map_msg::Column::EbrdSeq.eq(ebrd_seq));

    if running {
      let now = Local::now().format("%Y%m%d%H%M").to_string();
      log::error!("now: {}", now);
      filter = filter.add(tb_ebrd_msg::Column::StartDt.lte(now.to_owned()));
      filter = filter.add(tb_ebrd_msg::Column::EndDt.gte(now.to_owned()));
      filter = filter.add(tb_ebrd_map_msg::Column::SendStat.eq("Y"));
    }

    query = query.filter(filter).order_by_asc(tb_ebrd_map_msg::Column::EbrdMsgPos);

    if let Some(page) = page {
      let offset = (page - 1) * 10;
      query = query.offset(offset).limit(10);
    }

    //let rslt = query.filter(filter).into_model::<EbrdMsgInfo>().all(db).await;
    let rslt = query.into_model::<EbrdMsgInfo>().all(db).await;

    rslt
  }

  pub async fn find_emerlist(db: &DbConn, ebrd_seq: i32) -> Result<Vec<EbrdMsgInfo>, DbErr> {
    let mut query = Self::get_query();

    let mut filter = Condition::all();
    filter = filter.add(tb_ebrd_map_msg::Column::EbrdSeq.eq(ebrd_seq));
    filter = filter.add(tb_ebrd_map_msg::Column::SendStat.eq("Y"));
    filter = filter.add(tb_ebrd_map_msg::Column::EbrdMsgPos.lte(5));

    query = query.filter(filter).order_by_asc(tb_ebrd_map_msg::Column::EbrdMsgPos);

    let rslt = query.into_model::<EbrdMsgInfo>().all(db).await;

    rslt
  }

  pub async fn find_notemerlist(db: &DbConn, ebrd_seq: i32) -> Result<Vec<EbrdMsgInfo>, DbErr> {
    let mut query = Self::get_query();

    let mut filter = Condition::all();
    filter = filter.add(tb_ebrd_map_msg::Column::EbrdSeq.eq(ebrd_seq));
    filter = filter.add(tb_ebrd_map_msg::Column::SendStat.eq("Y"));
    filter = filter.add(tb_ebrd_map_msg::Column::EbrdMsgPos.gt(5));
    let now = Local::now().format("%Y%m%d%H%M").to_string();
    log::error!("now: {}", now);
    filter = filter.add(tb_ebrd_msg::Column::StartDt.lte(now.to_owned()));
    filter = filter.add(tb_ebrd_msg::Column::EndDt.gte(now.to_owned()));

    query = query.filter(filter).order_by_asc(tb_ebrd_map_msg::Column::EbrdMsgPos);

    let rslt = query.into_model::<EbrdMsgInfo>().all(db).await;

    rslt
  }
}
