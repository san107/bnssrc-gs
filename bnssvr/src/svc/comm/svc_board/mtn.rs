use crate::entities::prelude::*;
use crate::entities::{tb_board, tb_board::ActiveModel};
use sea_orm::*;
use chrono::Local;
use actix_multipart::form::bytes::Bytes;
use crate::svc::comm::svc_file;

pub struct Mtn;

impl Mtn {
  pub async fn save_form(
    db: &DbConn,
    file: Option<Bytes>,
    model: &mut tb_board::Model,
  ) -> Result<tb_board::Model, DbErr> {
    let tx = db.begin().await?;

    if file.is_some() {
      let file = svc_file::mtn::Mtn::save(&tx, None, file.unwrap()).await?;
      let file = file.try_into_model().unwrap();
      model.file_seq = Some(file.file_seq);
    }

    let seq = model.bd_seq;
    let now = Local::now().naive_local();
    
    let mut am = model.clone().into_active_model();

    if seq < 0 {
      am.not_set(tb_board::Column::BdSeq);
      am.bd_create_dt = Set(now);
      am.bd_update_dt = Set(now);
      am.bd_views = Set(Some(0));
    } else {
      let v = seq as i32;
      am = am.reset_all().clone();
      am.set(tb_board::Column::BdSeq, sea_orm::Value::Int(Some(v))); // update.
      am.bd_update_dt = Set(now);
      am.bd_views = Set(Some(model.bd_views.unwrap_or(0) + 1));
    }

    let board = am.save(&tx).await?;
    tx.commit().await?;

    Ok(board.try_into_model().unwrap())
  }

  pub async fn save(db: &DbConn, data: serde_json::Value) -> Result<tb_board::ActiveModel, DbErr> {
    let mut c: ActiveModel = Default::default();
      
    let seq = data.get("bd_seq");
    let mut data = data.clone();
    let now = Local::now().naive_local();
    
    if seq == None {
      let v: serde_json::Value = 1i32.into();
      data["bd_seq"] = v;
      data["bd_create_dt"] = serde_json::to_value(now).unwrap();
      data["bd_update_dt"] = serde_json::to_value(now).unwrap();
      data["bd_views"] = serde_json::to_value(0i32).unwrap();
    } else {
      data["bd_update_dt"] = serde_json::to_value(now).unwrap();
      data["bd_views"] = serde_json::to_value(data["bd_views"].as_i64().unwrap_or(0) + 1).unwrap();
    }
    
    c.set_from_json(data.clone()).unwrap();
    if seq == None {
      c.not_set(tb_board::Column::BdSeq);
    } else {
      let v = seq.unwrap().as_i64().unwrap() as i32;
      c.set(tb_board::Column::BdSeq, sea_orm::Value::Int(Some(v)));
    }
    c.save(db).await
  }

  #[allow(dead_code)]
  pub async fn delete(db: &DbConn, seq: i32) -> Result<DeleteResult, DbErr> {
    let model = TbBoard::find_by_id(seq)
      .one(db)
      .await?
      .ok_or(DbErr::Custom("Cannot find data.".to_owned()))?;

    // 첨부파일이 있으면 삭제
    if let Some(file_seq) = model.file_seq {
      svc_file::mtn::Mtn::delete(db, file_seq).await?;
    }

    model.into_active_model().delete(db).await
  }

  pub async fn update_disp_seqs(db: &DbConn, data: serde_json::Value) -> Result<(), DbErr> {
    let list = data.as_array();
    if list == None {
      return Err(DbErr::Custom("Invalid data.".to_owned()));
    }
    let list = list.unwrap();
    for v in list {
      let mut c: ActiveModel = Default::default();
      c.bd_seq = Set(v["bd_seq"].as_i64().unwrap() as i32);
      c.disp_seq = Set(Some(v["disp_seq"].as_i64().unwrap() as i32));
      let r = c.update(db).await;
      if let Err(e) = r.as_ref() {
        log::error!("db error {e:?}");
      }
     }
  
     Ok(())
  }
} 