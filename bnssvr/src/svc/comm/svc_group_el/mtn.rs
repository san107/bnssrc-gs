use crate::entities::prelude::*;
use crate::entities::tb_group_el::Column;
use crate::entities::{tb_group_el, tb_group_el::ActiveModel};
use sea_orm::*;
// use sea_query::OnConflict;
use log::info;

#[allow(dead_code)]
pub struct Mtn;
impl Mtn {
  #[allow(dead_code)]
  pub async fn save_group_el(db: &DbConn, data: serde_json::Value) -> Result<InsertResult<ActiveModel>, DbErr> {
    let mut models: Vec<ActiveModel> = vec![];

    let seq = data.get("grpSeq");
    let seq = seq.unwrap().as_i64().unwrap() as i32;

    TbGroupEl::delete_many()
      .filter(Column::GrpSeq.eq(seq))
      .exec(db)
      .await
      .unwrap();

    if let serde_json::Value::Array(arr) = &data["list"] {
      for v in arr {
        let mut c: ActiveModel = Default::default();
        let grp_seq = v["grp_seq"].as_i64().unwrap() as i32;
        let grp_el_seq = v["grp_el_seq"].as_i64().unwrap() as i32;

        c.set_from_json(v.clone()).expect("fail json value to active model");
        c.set(tb_group_el::Column::GrpSeq, sea_orm::Value::Int(Some(grp_seq)));
        c.set(tb_group_el::Column::GrpElSeq, sea_orm::Value::Int(Some(grp_el_seq)));
        models.push(c);
      }
    }
    info!("models info {:?}", models);
    if models.len() == 0 {
      // 저장할 데이터가 없는 경우에도, 모든 데이터를 삭제하였으므로 성공으로 간주한다.
      return Ok(InsertResult { last_insert_id: (0, 0) });
    }

    TbGroupEl::insert_many(models)
      // .on_conflict(OnConflict::new().do_nothing().to_owned())
      .exec(db)
      .await
  }

  pub async fn delete_group_el(db: &DbConn, _seq: i32) -> Result<DeleteResult, DbErr> {
    let key = (1, 1);
    let model: ActiveModel = TbGroupEl::find_by_id(key)
      .one(db)
      .await?
      .ok_or(DbErr::Custom("Cannot find data.".to_owned()))
      .map(Into::into)?;

    model.delete(db).await
  }
}
