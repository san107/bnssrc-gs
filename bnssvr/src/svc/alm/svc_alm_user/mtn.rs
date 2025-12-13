use crate::entities::{prelude::*, tb_alm_sett};
use crate::entities::{tb_alm_user, tb_alm_user::ActiveModel};
use sea_orm::*;

#[allow(dead_code)]
pub struct Mtn;
impl Mtn {
  #[allow(dead_code)]
  pub async fn save(db: &DbConn, data: serde_json::Value) -> Result<tb_alm_user::ActiveModel, DbErr> {
    let mut c: ActiveModel = Default::default();
    let seq = data.get("alm_user_seq");
    let mut data = data.clone();
    if seq == None {
      let v: serde_json::Value = 1i32.into();
      data["alm_user_seq"] = v;
    }

    c.set_from_json(data).expect("Fail Json to Model");

    if seq == None {
      c.not_set(tb_alm_user::Column::AlmUserSeq);
    } else {
      let v = seq.unwrap().as_i64().unwrap() as i32;
      c.set(tb_alm_user::Column::AlmUserSeq, sea_orm::Value::Int(Some(v)));
    }
    c.save(db).await
  }

  #[allow(dead_code)]
  pub async fn delete(db: &DbConn, key: i32) -> Result<DeleteResult, DbErr> {
    // 경보도 삭제함.
    TbAlmSett::delete_many()
      .filter(tb_alm_sett::Column::AlmUserSeq.eq(key))
      .exec(db)
      .await
      .unwrap();

    let model: ActiveModel = TbAlmUser::find_by_id(key)
      .one(db)
      .await?
      .ok_or(DbErr::Custom("Cannot find Record".to_owned()))
      .map(Into::into)?;

    model.delete(db).await
  }
}
