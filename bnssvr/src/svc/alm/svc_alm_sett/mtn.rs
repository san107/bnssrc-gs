use crate::entities::prelude::*;
use crate::entities::tb_alm_sett::Column;
use crate::entities::{tb_alm_sett, tb_alm_sett::ActiveModel};
use sea_orm::*;

#[allow(dead_code)]
pub struct Mtn;
impl Mtn {
  #[allow(dead_code)]
  pub async fn save(db: &DbConn, _data: serde_json::Value) -> Result<tb_alm_sett::Model, DbErr> {
    let c: ActiveModel = Default::default();

    let key = (1, 1);
    match TbAlmSett::find_by_id(key).one(db).await {
      Ok(Some(_ele)) => c.update(db).await,
      Ok(None) => c.insert(db).await,
      Err(e) => Err(e),
    }

    //c.save(db).await
  }

  pub async fn saves(db: &DbConn, data: serde_json::Value) -> Result<InsertResult<ActiveModel>, DbErr> {
    let mut models: Vec<ActiveModel> = vec![];

    // 트랜잭션 처리할 것.
    // 우선 alm_user_seq 를 기준으로 삭제하도록.
    let seq = data.get("almUserSeq");
    let seq = seq.unwrap().as_i64().unwrap() as i32;

    TbAlmSett::delete_many()
      .filter(Column::AlmUserSeq.eq(seq))
      .exec(db)
      .await
      .unwrap();

    if let serde_json::Value::Array(arr) = &data["list"] {
      for v in arr {
        let mut c: ActiveModel = Default::default();
        let water_seq = v["water_seq"].as_i64().unwrap() as i32;
        let alm_user_seq = v["alm_user_seq"].as_i64().unwrap() as i32;
        c.set_from_json(v.clone()).expect("fail json value to active model");
        c.set(tb_alm_sett::Column::WaterSeq, sea_orm::Value::Int(Some(water_seq)));
        c.set(tb_alm_sett::Column::AlmUserSeq, sea_orm::Value::Int(Some(alm_user_seq)));
        models.push(c);
      }
    }
    if models.len() == 0 {
      // 저장할 데이터가 없는 경우에도, 모든 데이터를 삭제하였으므로 성공으로 간주한다.
      return Ok(InsertResult { last_insert_id: (0, 0) });
    }

    //TbAlmSett::insert_many(models).exec(db).await
    TbAlmSett::insert_many(models)
      .on_conflict(
        sea_query::OnConflict::columns([Column::AlmUserSeq, Column::WaterSeq])
          .update_columns([Column::SmsAlertYn, Column::SmsAttnYn, Column::SmsCritYn, Column::SmsWarnYn])
          .to_owned(),
      )
      .exec(db)
      .await
  }

  #[allow(dead_code)]
  pub async fn delete(db: &DbConn, _id: &str) -> Result<DeleteResult, DbErr> {
    let key = (1, 1);
    let model: ActiveModel = TbAlmSett::find_by_id(key)
      .one(db)
      .await?
      .ok_or(DbErr::Custom("Cannot find data.".to_owned()))
      .map(Into::into)?;

    model.delete(db).await
  }
}
