use crate::entities::{prelude::*, tb_water_hist};
use crate::entities::{tb_water, tb_water::ActiveModel};
use crate::models::cd::CommStat;
use crate::svc::water::svc_water;
use crate::util;
use sea_orm::*;

#[allow(dead_code)]
pub struct Mtn;
impl Mtn {
  pub async fn save(db: &DbConn, data: serde_json::Value) -> Result<tb_water::ActiveModel, DbErr> {
    let mut c: ActiveModel = Default::default();
    let seq = data.get("water_seq");
    let mut data = data.clone();
    if seq == None {
      let v: serde_json::Value = 1i32.into();
      //*data.pointer_mut("/cam_seq").unwrap() = v;
      data["water_seq"] = v;
    }
    c.set_from_json(data.clone()).unwrap();
    c.water_dt = NotSet;
    c.water_level = NotSet;
    c.water_stat = NotSet;
    c.comm_stat = NotSet;
    if seq == None {
      c.not_set(tb_water::Column::WaterSeq);
    } else {
      let v = seq.unwrap().as_i64().unwrap() as i32;
      c.set(tb_water::Column::WaterSeq, sea_orm::Value::Int(Some(v)));
    }
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
      c.water_seq = Set(v["water_seq"].as_i64().unwrap() as i32);
      c.disp_seq = Set(Some(v["disp_seq"].as_i64().unwrap() as i32));
      let r = c.update(db).await;
      if let Err(e) = r.as_ref() {
        log::error!("db error {e:?}");
      }
    }

    Ok(())
  }

  pub async fn update_evt(db: &DbConn, data: &tb_water_hist::Model) -> anyhow::Result<tb_water::ActiveModel> {
    // 1. find by water_seq
    // 2. update water_dt, water_level, water_stat, comm_stat

    let model = svc_water::qry::Qry::find_by_devid(db, &data.water_dev_id).await;
    if let Err(e) = model {
      return Err(anyhow::Error::from(e));
    }
    let model = model.unwrap();
    if model.is_none() {
      return Err(anyhow::Error::from(DbErr::Custom("Cannot find data.".to_owned())));
    }
    let model = model.unwrap();

    let water_stat = util::get_water_stat(model.clone(), data.water_level);

    let mut c: ActiveModel = model.into();

    c.water_dt = Set(Some(data.water_dt));
    c.water_level = Set(Some(data.water_level));
    c.water_stat = Set(Some(water_stat));
    c.comm_stat = Set(Some(CommStat::Ok.to_string()));

    c.save(db).await.map_err(anyhow::Error::from)
  }

  pub async fn update_comm_stat(db: &DbConn, seq: i32, status: CommStat) -> anyhow::Result<tb_water::ActiveModel> {
    // 1. find by water_seq
    // 2. update water_stat, comm_stat

    let mut c: ActiveModel = Default::default();
    c.water_seq = Set(seq);
    c.comm_stat = Set(Some(status.to_string()));
    c.save(db).await.map_err(anyhow::Error::from)
  }

  pub async fn delete(db: &DbConn, seq: i32) -> Result<DeleteResult, DbErr> {
    let model: ActiveModel = TbWater::find_by_id(seq)
      .one(db)
      .await?
      .ok_or(DbErr::Custom("Cannot find data.".to_owned()))
      .map(Into::into)?;

    model.delete(db).await
  }
}
