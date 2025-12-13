use crate::entities::prelude::*;
use crate::entities::tb_water_hist::Model;
use crate::entities::{tb_water_hist, tb_water_hist::ActiveModel};
use crate::svc::water::svc_water;
use chrono::{DateTime, Local, NaiveDateTime};
use sea_orm::*;

#[allow(dead_code)]
pub struct Mtn;
impl Mtn {
  pub async fn save(db: &DbConn, data: serde_json::Value) -> Result<tb_water_hist::ActiveModel, DbErr> {
    let water_level: f64 = data["Mea_Level"]
      .as_str()
      .ok_or(DbErr::Custom("Mea_Level is null.".to_owned()))?
      .parse()
      .map_err(|e| DbErr::Custom(format!("Mea_Level is not a number: {}", e)))?;

    let water_dt = NaiveDateTime::parse_from_str(data["Mea_Date"].as_str().unwrap(), "%Y-%m-%d %H:%M:%S").unwrap();
    let m = Model {
      water_dev_id: data["Dev_Addr"].as_str().unwrap().to_owned(),
      water_dt,
      water_level,
      water_hist_seq: 0,
    };
    let mut c = m.into_active_model();
    c.not_set(tb_water_hist::Column::WaterHistSeq);
    c.save(db).await
  }

  pub async fn save_level(db: &DbConn, dev_id: &str, level: f64) -> Result<tb_water_hist::ActiveModel, DbErr> {
    let local: DateTime<Local> = Local::now();
    let m = Model {
      water_dev_id: dev_id.to_owned(),
      water_dt: local.naive_local(),
      water_level: level,
      water_hist_seq: 0,
    };
    let mut c = m.into_active_model();
    c.not_set(tb_water_hist::Column::WaterHistSeq);
    c.save(db).await
  }

  pub async fn save_onoff1(db: &DbConn, dev_id: &str, onoff1: bool) -> Result<tb_water_hist::ActiveModel, DbErr> {
    let local: DateTime<Local> = Local::now();

    let water = svc_water::qry::Qry::find_by_devid(db, dev_id)
      .await?
      .ok_or(DbErr::Custom("Cannot find data.".to_owned()))?;

    let m = Model {
      water_dev_id: dev_id.to_owned(),
      water_dt: local.naive_local(),
      water_level: if onoff1 { water.limit_crit } else { 0.0 },
      water_hist_seq: 0,
    };
    let mut c = m.into_active_model();
    c.not_set(tb_water_hist::Column::WaterHistSeq);
    c.save(db).await
  }

  pub async fn save_onoff2(db: &DbConn, dev_id: &str, onoff1: bool, onoff2: bool) -> Result<tb_water_hist::ActiveModel, DbErr> {
    let local: DateTime<Local> = Local::now();

    let water = svc_water::qry::Qry::find_by_devid(db, dev_id)
      .await?
      .ok_or(DbErr::Custom("Cannot find data.".to_owned()))?;

    let m = Model {
      water_dev_id: dev_id.to_owned(),
      water_dt: local.naive_local(),
      water_level: if onoff2 {
        water.limit_crit
      } else if onoff1 {
        water.limit_warn
      } else {
        0.0
      },
      water_hist_seq: 0,
    };
    let mut c = m.into_active_model();
    c.not_set(tb_water_hist::Column::WaterHistSeq);
    c.save(db).await
  }

  #[allow(dead_code)]
  pub async fn save_model(db: &DbConn, model: Model) -> Result<tb_water_hist::ActiveModel, DbErr> {
    let data = serde_json::to_value(model).unwrap();
    Mtn::save(db, data).await
  }

  #[allow(dead_code)]
  pub async fn delete(db: &DbConn, seq: i32) -> Result<DeleteResult, DbErr> {
    let model: ActiveModel = TbWaterHist::find_by_id(seq)
      .one(db)
      .await?
      .ok_or(DbErr::Custom("Cannot find data.".to_owned()))
      .map(Into::into)?;

    model.delete(db).await
  }
}
