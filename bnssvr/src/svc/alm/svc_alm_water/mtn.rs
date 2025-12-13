use crate::entities::prelude::*;
use crate::entities::{tb_alm_water, tb_alm_water::ActiveModel};
use crate::models::cd::WaterStat;
use chrono::{DateTime, Local};
use sea_orm::*;
use sea_query::OnConflict;

#[allow(dead_code)]
pub struct Mtn;
impl Mtn {
  #[allow(dead_code)]
  pub async fn save(db: &DbConn, _data: serde_json::Value) -> Result<tb_alm_water::Model, DbErr> {
    let c: ActiveModel = Default::default();

    let key = 1;
    match TbAlmWater::find_by_id(key).one(db).await {
      Ok(Some(_ele)) => c.update(db).await,
      Ok(None) => c.insert(db).await,
      Err(e) => Err(e),
    }

    //c.save(db).await
  }

  pub async fn save_stat(db: &DbConn, seq: i32, stat: WaterStat) -> Result<InsertResult<ActiveModel>, DbErr> {
    let mut c: ActiveModel = Default::default();
    let local: DateTime<Local> = Local::now();
    c.water_seq = Set(seq);
    c.sms_water_stat = Set(Some(stat.to_string()));
    c.sms_water_stat_dt = Set(Some(local.naive_local()));
    // match TbAlmWater::find_by_id(seq).one(db).await {
    //   Ok(Some(_ele)) => c.update(db).await,
    //   Ok(None) => c.insert(db).await,
    //   Err(e) => Err(e),
    // }

    let on_conflict = OnConflict::column(tb_alm_water::Column::WaterSeq)
      .update_columns([tb_alm_water::Column::SmsWaterStat, tb_alm_water::Column::SmsWaterStatDt])
      .to_owned();

    TbAlmWater::insert(c).on_conflict(on_conflict.clone()).exec(db).await

    //TbAlmWater::insert_many([c]).on_conflict(on_conflict.clone()).exec(db).await
  }

  #[allow(dead_code)]
  pub async fn delete(db: &DbConn, _id: &str) -> Result<DeleteResult, DbErr> {
    let key = 1;
    let model: ActiveModel = TbAlmWater::find_by_id(key)
      .one(db)
      .await?
      .ok_or(DbErr::Custom("Cannot find data.".to_owned()))
      .map(Into::into)?;

    model.delete(db).await
  }
}
