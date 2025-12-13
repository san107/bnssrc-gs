use crate::entities::prelude::*;
use crate::entities::{tb_ebrd_map_msg, tb_ebrd_map_msg::ActiveModel};
use chrono::{DateTime, Local};
use sea_orm::*;

#[allow(dead_code)]
pub struct Mtn;
impl Mtn {
  async fn get_save_pos<C>(db: &C, is_emer: bool, ebrd_seq: i32) -> Result<i32, DbErr>
  where
    C: ConnectionTrait,
  {
    let poss = super::qry::Qry::find_pos_by_ebrd_seq(db, ebrd_seq).await?;
    if is_emer {
      let mut before = 0;
      for pos in poss {
        if pos > 5 {
          if before + 1 < 6 {
            return Ok(before + 1);
          }
          return Err(DbErr::Custom("No available position for message".to_owned()));
        }
        if pos - before > 1 {
          return Ok(before + 1);
        }
        before = pos;
      }

      before = before + 1;
      if before < 6 {
        return Ok(before);
      }

      return Err(DbErr::Custom("No available position for message".to_owned()));
    }

    let mut before = 5;
    for pos in poss {
      if pos < 6 {
        continue;
      }
      if pos > 100 {
        return Err(DbErr::Custom("No available position for message".to_owned()));
      }
      if pos - before > 1 {
        return Ok(before + 1);
      }
      before = pos;
    }

    before = before + 1;
    if before < 101 {
      return Ok(before);
    }

    return Err(DbErr::Custom("No available position for message".to_owned()));
  }
  pub async fn save_map<C>(db: &C, is_emer: bool, ebrd_seq: i32, ebrd_msg_seq: i32) -> Result<i32, DbErr>
  where
    C: ConnectionTrait,
  {
    // 수정 전송의 경우, 긴급메시지 여부는 수정가능하지 않도록 제한할 것.

    // 1. 만약에, 전광판에, 동일한 메시지 ID가 있으면 상태만 업데이트 하도록.
    let map = super::qry::Qry::find_by_msg_seq(db, ebrd_seq, ebrd_msg_seq).await?;
    if map.is_some() {
      let mut map = map.unwrap();
      map.send_rslt = "".to_string();
      map.send_stat = "".to_string();
      map.send_dt = None;
      let mut am = ActiveModel::from(map.clone());
      am = am.reset_all();
      log::info!("update ebrd_map_msg {:?}", am);
      am.update(db).await?;
      return Ok(map.ebrd_msg_pos);
    }

    // 빈방찾는 방법.
    let pos = Self::get_save_pos(db, is_emer, ebrd_seq).await?; // 자리가 없으면 처리할 수 없음.
    let model: tb_ebrd_map_msg::Model = tb_ebrd_map_msg::Model {
      ebrd_msg_seq: ebrd_msg_seq,
      ebrd_seq: ebrd_seq,
      ebrd_msg_pos: pos,
      send_stat: "".to_string(),
      send_rslt: "".to_string(),
      send_dt: None,
    };

    let am = ActiveModel::from(model);
    am.insert(db).await?;
    Ok(pos)
  }

  pub async fn save(db: &DbConn, data: serde_json::Value) -> Result<tb_ebrd_map_msg::ActiveModel, DbErr> {
    let mut e: ActiveModel = Default::default();
    let seq = data.get("ebrd_seq");
    let pos = data.get("ebrd_msg_pos");
    let mut data = data.clone();

    if seq == None {
      let v: serde_json::Value = 0.into();
      data["ebrd_seq"] = v;
    }

    if pos == None {
      let v: serde_json::Value = 0.into();
      data["ebrd_msg_pos"] = v;
    }

    e.set_from_json(data.clone()).unwrap();

    if seq == None {
      e.not_set(tb_ebrd_map_msg::Column::EbrdSeq);
    } else {
      let v = seq.unwrap().as_i64().unwrap() as i32;
      e.set(tb_ebrd_map_msg::Column::EbrdSeq, sea_orm::Value::Int(Some(v)));
    }

    if pos == None {
      e.not_set(tb_ebrd_map_msg::Column::EbrdMsgPos);
    } else {
      let v = pos.unwrap().as_i64().unwrap() as i32;
      e.set(tb_ebrd_map_msg::Column::EbrdMsgPos, sea_orm::Value::Int(Some(v)));
    }

    e.save(db).await
  }

  pub async fn delete(db: &DbConn, seq: i32, pos: i32) -> Result<DeleteResult, DbErr> {
    let model: ActiveModel = TbEbrdMapMsg::find_by_id((seq, pos))
      .one(db)
      .await?
      .ok_or(DbErr::Custom("Cannot find data.".to_owned()))
      .map(Into::into)?;

    model.delete(db).await
  }

  pub async fn delete_all_by_ebrd_seq(db: &DbConn, ebrd_seq: i32) -> Result<DeleteResult, DbErr> {
    TbEbrdMapMsg::delete_many()
      .filter(tb_ebrd_map_msg::Column::EbrdSeq.eq(ebrd_seq))
      .exec(db)
      .await
  }

  pub async fn update_send_yn(
    db: &DbConn,
    ebrd_seq: i32,
    pos: i32,
    send_yn: &str,
    send_rslt: &str,
  ) -> Result<tb_ebrd_map_msg::Model, DbErr> {
    let mut am: ActiveModel = Default::default();
    let local: DateTime<Local> = Local::now();
    am.ebrd_seq = Set(ebrd_seq);
    am.ebrd_msg_pos = Set(pos);
    am.send_stat = Set(send_yn.to_owned());
    am.send_rslt = Set(send_rslt.to_owned());
    am.send_dt = Set(Some(local.naive_local()));

    //
    am.update(db).await
  }
}
