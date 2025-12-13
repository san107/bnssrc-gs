use crate::entities::prelude::TbEmcallGrp;
use crate::entities::tb_emcall_grp;
use crate::entities::tb_emcall_grp::ActiveModel;
use sea_orm::DbConn;
use sea_orm::*;

pub struct Mtn;

impl Mtn {
  pub async fn save_emcall(db: &DbConn, data: serde_json::Value) -> Result<tb_emcall_grp::ActiveModel, DbErr> {
    let mut e: ActiveModel = Default::default();
    let seq = data.get("emcall_grp_seq");
    let mut data = data.clone();

    if seq == None {
      let v: serde_json::Value = 0.into();
      data["emcall_grp_seq"] = v;
    }

    e.set_from_json(data.clone()).unwrap();

    if seq == None {
      e.not_set(tb_emcall_grp::Column::EmcallGrpSeq);
    } else {
      let v = seq.unwrap().as_i64().unwrap() as i32;
      e.set(tb_emcall_grp::Column::EmcallGrpSeq, sea_orm::Value::Int(Some(v)));
    }

    log::info!("save_emcall: {e:?}");
    e.save(db).await
  }

  pub async fn delete_emcall(db: &DbConn, seq: i32) -> Result<DeleteResult, DbErr> {
    let emcall = tb_emcall_grp::Entity::find_by_id(seq).one(db).await?;
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
      c.emcall_grp_seq = Set(v["emcall_grp_seq"].as_i64().unwrap() as i32);
      c.disp_seq = Set(Some(v["disp_seq"].as_i64().unwrap() as i32));
      let r = c.update(db).await;
      if let Err(e) = r.as_ref() {
        log::error!("db error {e:?}");
      }
    }

    Ok(())
  }

  pub async fn update_comm_stat_by_key(db: &DbConn, seq: i32, comm_stat: String) -> Result<tb_emcall_grp::Model, DbErr> {
    let row = TbEmcallGrp::find_by_id(seq).one(db).await?;
    if row.is_none() {
      return Err(DbErr::RecordNotFound(format!("emcall not found: {}", seq)));
    }
    let row = row.unwrap();

    // 이미 같은 상태면 그냥 리턴.
    if row.comm_stat.as_ref() == Some(&comm_stat) {
      return Ok(row);
    }

    let mut amodel = row.into_active_model();

    amodel.comm_stat = Set(Some(comm_stat));

    amodel.update(db).await
  }

  pub async fn update_stat_json_by_key(
    db: &DbConn,
    seq: i32,
    comm_stat: String,
    json: Option<String>,
  ) -> Result<tb_emcall_grp::Model, DbErr> {
    let row = TbEmcallGrp::find_by_id(seq).one(db).await?;
    if row.is_none() {
      return Err(DbErr::RecordNotFound(format!("emcall not found: {}", seq)));
    }
    let row = row.unwrap();

    let mut amodel = row.into_active_model();

    amodel.comm_stat = Set(Some(comm_stat));
    amodel.emcall_grp_stat_json = Set(json);

    amodel.update(db).await
  }
}
