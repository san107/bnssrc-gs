use crate::entities::prelude::*;
use crate::entities::tb_water_grp::Column;
use crate::entities::{tb_water_grp, tb_water_grp::ActiveModel};
use sea_orm::*;
//use sea_query::OnConflict;

#[allow(dead_code)]
pub struct Mtn;
impl Mtn {
  #[allow(dead_code)]
  pub async fn save(db: &DbConn, _data: serde_json::Value) -> Result<tb_water_grp::Model, DbErr> {
    let c: ActiveModel = Default::default();

    let key = (1, 1);
    match TbWaterGrp::find_by_id(key).one(db).await {
      Ok(Some(_ele)) => c.update(db).await,
      Ok(None) => c.insert(db).await,
      Err(e) => Err(e),
    }

    //c.save(db).await
  }

  #[allow(dead_code)]
  pub async fn saves(db: &DbConn, data: serde_json::Value) -> Result<InsertResult<ActiveModel>, DbErr> {
    let tx = db.begin().await?;

    let seqs = data
      .as_array()
      .map(|arr| arr.iter().filter_map(|v| v.as_i64().map(|n| n as i32)).collect::<Vec<i32>>())
      .unwrap_or_default();

    TbWaterGrp::delete_many()
      .filter(
        Column::WaterSeq
          .is_in(seqs.clone())
          .or(Column::LnkWaterSeq.is_in(seqs.clone())),
      )
      .exec(&tx)
      .await?;

    let mut models: Vec<ActiveModel> = vec![];
    for seq in seqs.clone() {
      for lnk_seq in seqs.clone() {
        if seq == lnk_seq {
          continue; // 동일하면 저장하지 않는다.
        }

        let mut c: ActiveModel = Default::default();
        c.set(tb_water_grp::Column::WaterSeq, sea_orm::Value::Int(Some(seq)));
        c.set(tb_water_grp::Column::LnkWaterSeq, sea_orm::Value::Int(Some(lnk_seq)));
        models.push(c);
      }
    }

    if models.len() == 0 {
      // 저장할 데이터가 없는 경우에도, 모든 데이터를 삭제하였으므로 성공으로 간주한다.
      tx.commit().await?;
      return Ok(InsertResult { last_insert_id: (0, 0) });
    }

    let rlt = TbWaterGrp::insert_many(models).exec(&tx).await;
    // if rlt.is_err() {
    //   return rlt;
    // }

    tx.commit().await?;
    rlt
  }

  #[allow(dead_code)]
  pub async fn delete(db: &DbConn, _id: &str) -> Result<DeleteResult, DbErr> {
    let key = (1, 1);
    let model: ActiveModel = TbWaterGrp::find_by_id(key)
      .one(db)
      .await?
      .ok_or(DbErr::Custom("Cannot find data.".to_owned()))
      .map(Into::into)?;

    model.delete(db).await
  }
}
