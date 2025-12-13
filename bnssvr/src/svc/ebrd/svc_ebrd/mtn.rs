use crate::entities::prelude::*;
use crate::entities::{tb_ebrd, tb_ebrd::ActiveModel};
use crate::svc::ebrd::svc_ebrd;
use sea_orm::*;

#[allow(dead_code)]
pub struct Mtn;
impl Mtn {
  pub async fn update_weather_msg(db: &DbConn, ebrd_id: &str, weather_msg: &str) -> Result<tb_ebrd::Model, DbErr> {
    let model = svc_ebrd::qry::Qry::find_by_ebrd_id(db, ebrd_id).await?;
    if model.is_none() {
      return Err(DbErr::Custom(format!("Cannot find data. ebrd_id: {ebrd_id}")));
    }
    let model = model.unwrap();

    let mut c: ActiveModel = Default::default();
    c.ebrd_seq = Set(model.ebrd_seq);
    c.ebrd_weather_msg = Set(Some(weather_msg.to_string()));
    c.update(db).await
  }

  pub async fn update_disp_msg(db: &DbConn, ebrd_seq: i32, msg: &str) -> Result<tb_ebrd::Model, DbErr> {
    let model = svc_ebrd::qry::Qry::find_by_id_root(db, ebrd_seq).await?;
    if model.is_none() {
      return Err(DbErr::Custom(format!("Cannot find data. ebrd_seq: {ebrd_seq}")));
    }
    let model = model.unwrap();

    let mut c: ActiveModel = Default::default();
    c.ebrd_seq = Set(model.ebrd_seq);
    c.ebrd_disp_msg = Set(Some(msg.to_string()));
    c.update(db).await
  }

  pub async fn update_event(db: &DbConn, ebrd_id: &str, event: &str) -> Result<tb_ebrd::Model, DbErr> {
    let model = svc_ebrd::qry::Qry::find_by_ebrd_id(db, ebrd_id).await?;
    if model.is_none() {
      return Err(DbErr::Custom(format!("Cannot find data. ebrd_id: {ebrd_id}")));
    }
    let model = model.unwrap();

    let mut c: ActiveModel = Default::default();
    c.ebrd_seq = Set(model.ebrd_seq);
    c.ebrd_event = Set(Some(event.to_string()));
    c.update(db).await
  }

  pub async fn save_ebrd(db: &DbConn, data: serde_json::Value) -> Result<tb_ebrd::ActiveModel, DbErr> {
    let mut e: ActiveModel = Default::default();
    let seq = data.get("ebrd_seq");
    let mut data = data.clone();

    if seq == None {
      let v: serde_json::Value = 0.into();
      data["ebrd_seq"] = v;
    }

    e.set_from_json(data.clone()).unwrap();

    if seq == None {
      e.not_set(tb_ebrd::Column::EbrdSeq);
      e.send_yn = Set("N".to_string());
    } else {
      let v = seq.unwrap().as_i64().unwrap() as i32;
      e.set(tb_ebrd::Column::EbrdSeq, sea_orm::Value::Int(Some(v)));
      e.send_yn = Set("N".to_string());
    }

    e.save(db).await
  }

  pub async fn delete_ebrd(db: &DbConn, seq: i32) -> Result<DeleteResult, DbErr> {
    let model: ActiveModel = TbEbrd::find_by_id(seq)
      .one(db)
      .await?
      .ok_or(DbErr::Custom("Cannot find data.".to_owned()))
      .map(Into::into)?;

    model.delete(db).await
  }

  pub async fn update_send_yn(db: &DbConn, seq: i32, send_yn: &str) -> Result<tb_ebrd::Model, DbErr> {
    let mut c: ActiveModel = Default::default();
    c.ebrd_seq = Set(seq);
    c.send_yn = Set(send_yn.to_string());
    c.update(db).await
  }

  pub async fn update_disp_seqs(db: &DbConn, data: serde_json::Value) -> Result<(), DbErr> {
    let list = data.as_array();
    if list == None {
      return Err(DbErr::Custom("Invalid data.".to_owned()));
    }
    let list = list.unwrap();
    for v in list {
      let mut c: ActiveModel = Default::default();
      c.ebrd_seq = Set(v["ebrd_seq"].as_i64().unwrap() as i32);
      c.disp_seq = Set(Some(v["disp_seq"].as_i64().unwrap() as i32));
      let r = c.update(db).await;
      if let Err(e) = r.as_ref() {
        log::error!("db error {e:?}");
      }
    }

    Ok(())
  }

  pub async fn update_comm_stat(
    db: &DbConn,
    seq: i32,
    ebrd_id: &str,
    comm_stat: &str,
    cmd_rslt: &str,
    cmd_rslt_cd: Option<i32>,
  ) -> Result<tb_ebrd::Model, DbErr> {
    let mut c: ActiveModel = Default::default();
    c.ebrd_seq = Set(seq);
    c.ebrd_id = Set(ebrd_id.to_string());
    c.comm_stat = Set(Some(comm_stat.to_string()));
    c.cmd_rslt = Set(Some(cmd_rslt.to_string()));
    c.cmd_rslt_cd = Set(cmd_rslt_cd);
    c.update(db).await?.try_into_model()
  }

  pub async fn update_emer_msg_pos(db: &DbConn, ebrd_seq: i32, ebrd_emer_msg_pos: Option<i32>) -> Result<tb_ebrd::Model, DbErr> {
    let mut c: ActiveModel = Default::default();
    c.ebrd_seq = Set(ebrd_seq);
    c.ebrd_emer_msg_pos = Set(ebrd_emer_msg_pos);
    c.update(db).await
  }
}
