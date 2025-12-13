use crate::entities::prelude::*;
use crate::entities::tb_emcall::ActiveModel;
use crate::entities::tb_emcall::{self};
use sea_orm::DbConn;
use sea_orm::*;

pub struct Mtn;

impl Mtn {
  pub async fn save_emcall(db: &DbConn, data: serde_json::Value) -> Result<tb_emcall::ActiveModel, DbErr> {
    let mut e: ActiveModel = Default::default();
    let seq = data.get("emcall_seq");
    let mut data = data.clone();

    if seq == None {
      let v: serde_json::Value = 0.into();
      data["emcall_seq"] = v;
    }

    e.set_from_json(data.clone()).unwrap();

    if seq == None {
      e.not_set(tb_emcall::Column::EmcallSeq);
    } else {
      let v = seq.unwrap().as_i64().unwrap() as i32;
      e.set(tb_emcall::Column::EmcallSeq, sea_orm::Value::Int(Some(v)));
    }

    e.save(db).await
  }

  pub async fn update_comm_stat_by_id(db: &DbConn, emcall_id: String, comm_stat: String) -> Result<tb_emcall::Model, DbErr> {
    let emcall = TbEmcall::find()
      .filter(tb_emcall::Column::EmcallId.eq(emcall_id.clone()))
      .one(db)
      .await?;
    if emcall.is_none() {
      return Err(DbErr::RecordNotFound(format!("emcall not found: {}", emcall_id)));
    }
    let emcall = emcall.unwrap();

    // 이미 같은 상태면 그냥 리턴.
    if emcall.comm_stat.as_ref() == Some(&comm_stat) {
      return Ok(emcall);
    }

    let mut emcall = emcall.into_active_model();

    emcall.comm_stat = Set(Some(comm_stat));

    emcall.update(db).await
  }

  pub async fn delete_emcall(db: &DbConn, seq: i32) -> Result<DeleteResult, DbErr> {
    let emcall = tb_emcall::Entity::find_by_id(seq).one(db).await?;
    if let Some(emcall) = emcall {
      emcall.delete(db).await
    } else {
      Err(DbErr::RecordNotFound(format!("emcall not found: {}", seq)))
    }
  }

  pub async fn update_disp_seqs(db: &DbConn, data: serde_json::Value) -> Result<(), DbErr> {
    let list = data.as_array();
    if list == None {
      return Err(DbErr::Custom("Invalid data.".to_owned()));
    }
    let list = list.unwrap();
    for v in list {
      let mut c: ActiveModel = Default::default();
      c.emcall_seq = Set(v["emcall_seq"].as_i64().unwrap() as i32);
      c.disp_seq = Set(Some(v["disp_seq"].as_i64().unwrap() as i32));
      let r = c.update(db).await;
      if let Err(e) = r.as_ref() {
        log::error!("db error {e:?}");
      }
    }

    Ok(())
  }
}
