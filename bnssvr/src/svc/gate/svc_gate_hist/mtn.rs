use crate::entities::prelude::*;
use crate::entities::tb_gate_hist::Model;
use crate::entities::{tb_gate_hist, tb_gate_hist::ActiveModel};
use crate::models::cd::{GateCmdRsltType, GateCmdType, GateStatus};
use ::chrono::{DateTime, Local};
use sea_orm::*;

#[allow(dead_code)]
pub struct Mtn;
impl Mtn {
  pub async fn save(db: &DbConn, data: serde_json::Value) -> Result<tb_gate_hist::ActiveModel, DbErr> {
    let mut c: ActiveModel = Default::default();

    let seq = data.get("gate_hist_seq");
    let mut data = data.clone();
    if seq == None {
      let v: serde_json::Value = 1i32.into();
      data["gate_hist_seq"] = v;
    }
    c.set_from_json(data.clone()).unwrap();
    if seq == None {
      c.not_set(tb_gate_hist::Column::GateHistSeq);
    } else {
      let v = seq.unwrap().as_i64().unwrap() as i32;
      c.set(tb_gate_hist::Column::GateHistSeq, sea_orm::Value::Int(Some(v)));
    }
    c.save(db).await
  }

  #[allow(dead_code)]
  pub async fn save_model(db: &DbConn, model: Model) -> Result<tb_gate_hist::ActiveModel, DbErr> {
    let data = serde_json::to_value(model).unwrap();
    Mtn::save(db, data).await
  }

  #[allow(dead_code)]
  pub async fn save_stat(
    db: &DbConn,
    seq: i32,
    stat: GateStatus,
    req: GateCmdType,
    rslt: GateCmdRsltType,
    msg: Option<String>,
  ) -> Result<tb_gate_hist::ActiveModel, DbErr> {
    let local: DateTime<Local> = Local::now();
    let mut amodel: tb_gate_hist::ActiveModel = Default::default();
    amodel.gate_seq = Set(seq);
    amodel.gate_stat = Set(stat.to_string().to_owned());
    amodel.update_dt = Set(local.naive_local());
    amodel.cmd_req = Set(req.to_string().to_owned());
    amodel.cmd_rslt = Set(rslt.to_string().to_owned());
    amodel.cmd_rslt_msg = Set(msg);
    amodel.save(db).await
  }

  pub async fn save_stat_ignr_rslt(
    db: &DbConn,
    seq: i32,
    stat: GateStatus,
    req: GateCmdType,
    rslt: GateCmdRsltType,
    msg: Option<String>,
  ) {
    match Mtn::save_stat(db, seq, stat, req, rslt, msg).await {
      Ok(_) => {}
      Err(e) => log::error!("update stat err {e:?}"),
    };
  }

  #[allow(dead_code)]
  pub async fn delete(db: &DbConn, seq: i32) -> Result<DeleteResult, DbErr> {
    let model: ActiveModel = TbGateHist::find_by_id(seq)
      .one(db)
      .await?
      .ok_or(DbErr::Custom("Cannot find data.".to_owned()))
      .map(Into::into)?;

    model.delete(db).await
  }
}
