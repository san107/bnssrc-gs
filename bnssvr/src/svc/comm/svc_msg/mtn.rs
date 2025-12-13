use crate::entities::prelude::*;
use crate::entities::{tb_msg, tb_msg::ActiveModel};
use sea_orm::*;

#[allow(dead_code)]
pub struct Mtn;
impl Mtn {
  pub async fn save_msg(db: &DbConn, data: serde_json::Value) -> Result<tb_msg::ActiveModel, DbErr> {
    let mut c: ActiveModel = Default::default();
    let seq = data.get("msg_seq");
    let mut data = data.clone();
    if seq == None {
      let v: serde_json::Value = 1i32.into();
      data["msg_seq"] = v;
    }
    c.set_from_json(data.clone()).unwrap();
    if seq == None {
      c.not_set(tb_msg::Column::MsgSeq);
    } else {
      let v = seq.unwrap().as_i64().unwrap() as i32;
      c.set(tb_msg::Column::MsgSeq, sea_orm::Value::Int(Some(v)));
    }
    c.save(db).await
  }

  pub async fn delete_msg(db: &DbConn, seq: i32) -> Result<DeleteResult, DbErr> {
    let model: ActiveModel = TbMsg::find_by_id(seq)
      .one(db)
      .await?
      .ok_or(DbErr::Custom("Cannot find data.".to_owned()))
      .map(Into::into)?;

    model.delete(db).await
  }
}
