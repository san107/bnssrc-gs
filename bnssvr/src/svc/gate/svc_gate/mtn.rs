use crate::entities::prelude::*;
use crate::entities::{tb_gate, tb_gate::ActiveModel};
use crate::models::cd::{GateCmdRsltType, GateStatus};
use sea_orm::*;

#[allow(dead_code)]
pub struct Mtn;
impl Mtn {
  pub async fn save_gate(db: &DbConn, data: serde_json::Value, skip_stat: bool) -> Result<tb_gate::ActiveModel, DbErr> {
    let mut c: ActiveModel = Default::default();
    let seq = data.get("gate_seq");
    let mut data = data.clone();
    if seq == None {
      let v: serde_json::Value = 1i32.into();
      //*data.pointer_mut("/cam_seq").unwrap() = v;
      data["gate_seq"] = v;
    }
    c.set_from_json(data.clone()).unwrap();
    if seq == None {
      c.not_set(tb_gate::Column::GateSeq);
    } else {
      let v = seq.unwrap().as_i64().unwrap() as i32;
      c.set(tb_gate::Column::GateSeq, sea_orm::Value::Int(Some(v)));
    }

    if skip_stat {
      //
      //c.set(tb_gate::Column::GateStat, ActiveValue::NotSet);
      c.not_set(tb_gate::Column::GateStat);
    }

    log::debug!("gate {:?}", c);

    c.save(db).await
  }

  pub async fn update_disp_seq(db: &DbConn, data: serde_json::Value) -> Result<(), DbErr> {
    let list = data.as_array();
    if list == None {
      return Err(DbErr::Custom("Invalid data.".to_owned()));
    }
    let list = list.unwrap();
    for v in list {
      let mut c: ActiveModel = Default::default();
      c.gate_seq = Set(v["gate_seq"].as_i64().unwrap() as i32);
      c.disp_seq = Set(Some(v["disp_seq"].as_i64().unwrap() as i32));
      let r = c.update(db).await;
      if let Err(e) = r.as_ref() {
        log::error!("db error {e:?}");
      }
    }

    Ok(())
  }

  pub async fn update_stat(db: &DbConn, seq: i32, stat: GateStatus, rslt: GateCmdRsltType) -> Result<tb_gate::Model, DbErr> {
    let mut amodel: tb_gate::ActiveModel = Default::default();
    amodel.gate_seq = Set(seq);
    amodel.gate_stat = Set(Some(stat.to_string().to_owned()));
    amodel.cmd_rslt = Set(Some(rslt.to_string().to_owned()));
    amodel.update(db).await
  }

  pub async fn update_stat_ignr_rslt(db: &DbConn, seq: i32, stat: GateStatus, rslt: GateCmdRsltType) {
    match Mtn::update_stat(db, seq, stat, rslt).await {
      Ok(_) => {}
      Err(e) => log::error!("update stat err {e:?}"),
    };
  }

  pub async fn delete_gate(db: &DbConn, seq: i32) -> Result<DeleteResult, DbErr> {
    let model: ActiveModel = TbGate::find_by_id(seq)
      .one(db)
      .await?
      .ok_or(DbErr::Custom("Cannot find data.".to_owned()))
      .map(Into::into)?;

    model.delete(db).await
  }
}
