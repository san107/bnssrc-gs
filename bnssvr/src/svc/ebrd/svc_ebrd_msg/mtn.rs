use crate::api::ebrd_msg::MetaEbrdMsg;
use crate::entities::prelude::*;
use crate::entities::{tb_ebrd_msg, tb_ebrd_msg::ActiveModel};
use crate::svc::{comm::svc_file, ebrd::svc_ebrd_map_msg};
use actix_multipart::form::bytes::Bytes;
use sea_orm::ActiveModelTrait;
use sea_orm::*;
#[allow(dead_code)]
pub struct Mtn;
impl Mtn {
  pub async fn save_form(
    db: &DbConn,
    file: Option<Bytes>,
    model: &mut tb_ebrd_msg::Model,
    meta: MetaEbrdMsg,
  ) -> Result<(tb_ebrd_msg::Model, Vec<(i32, i32)>), DbErr> {
    // 1. 파일 저장.
    // 2. ebrd_msg 저장.
    // 3. ebrd_map_msg 저장.

    let tx = db.begin().await?;

    if file.is_some() {
      let file_seq = if model.file_seq < 0 { None } else { Some(model.file_seq) };
      let file = svc_file::mtn::Mtn::save(&tx, file_seq, file.unwrap()).await?;
      let file = file.try_into_model().unwrap();

      model.file_seq = file.file_seq;
    }

    if model.file_seq < 0 {
      return Err(DbErr::Custom("file_seq is required".to_owned()));
    }

    let ebrd_msg_seq = model.ebrd_msg_seq;

    let mut am = model.clone().into_active_model();

    if ebrd_msg_seq < 0 {
      am.not_set(tb_ebrd_msg::Column::EbrdMsgSeq);
    } else {
      let v = ebrd_msg_seq as i32;
      am = am.reset_all().clone();
      am.set(tb_ebrd_msg::Column::EbrdMsgSeq, sea_orm::Value::Int(Some(v))); // update.
    }

    log::info!("save ebrd_msg {:?}", am);
    let ebrd_msg = am.save(&tx).await?;

    let mut map: Vec<(i32, i32)> = Vec::new();
    let ebrd_msg_seq = ebrd_msg.ebrd_msg_seq.clone().unwrap();

    // save ebrd_map_msg

    let is_emer = if model.emerg_yn == "Y" { true } else { false };

    for ebrd_seq in meta.ebrd_seqs {
      let pos = svc_ebrd_map_msg::mtn::Mtn::save_map(&tx, is_emer, ebrd_seq, ebrd_msg_seq).await;
      if pos.is_err() {
        let err = pos.err().unwrap();
        log::error!("save_map error {:?} {:?} {:?}", err, ebrd_seq, ebrd_msg_seq);
        map.push((ebrd_seq, -1));
        return Err(DbErr::Custom(format!(
          "save_map error {:?} {:?} {:?}",
          err, ebrd_seq, ebrd_msg_seq
        )));
      } else {
        map.push((ebrd_seq, pos.unwrap()));
      }
    }

    tx.commit().await?;

    Ok((ebrd_msg.try_into_model().unwrap(), map))
  }

  pub async fn save(db: &DbConn, data: serde_json::Value) -> Result<tb_ebrd_msg::ActiveModel, DbErr> {
    let mut e: ActiveModel = Default::default();
    let seq = data.get("ebrd_msg_seq");
    let mut data = data.clone();

    if seq == None {
      let v: serde_json::Value = 0.into();
      data["ebrd_msg_seq"] = v;
    }

    e.set_from_json(data.clone()).unwrap();

    if seq == None {
      e.not_set(tb_ebrd_msg::Column::EbrdMsgSeq);
    } else {
      let v = seq.unwrap().as_i64().unwrap() as i32;
      e.set(tb_ebrd_msg::Column::EbrdMsgSeq, sea_orm::Value::Int(Some(v)));
    }

    e.save(db).await
  }

  pub async fn update_msg(db: &DbConn, model: &tb_ebrd_msg::Model) -> Result<tb_ebrd_msg::Model, DbErr> {
    let am: ActiveModel = model.clone().into();
    let am = am.reset_all();
    am.update(db).await
  }

  pub async fn delete(db: &DbConn, seq: i32) -> Result<DeleteResult, DbErr> {
    let model: ActiveModel = TbEbrdMsg::find_by_id(seq)
      .one(db)
      .await?
      .ok_or(DbErr::Custom("Cannot find data.".to_owned()))
      .map(Into::into)?;

    model.delete(db).await
  }
}
