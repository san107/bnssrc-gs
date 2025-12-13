use crate::entities::prelude::*;
use crate::entities::{tb_camera, tb_camera::ActiveModel};
use crate::rtsp::stat_mgr::CamStat;
use chrono::{DateTime, Local};
use sea_orm::*;

#[allow(dead_code)]
pub struct Mtn;
impl Mtn {
  pub async fn save_camera(db: &DbConn, data: serde_json::Value) -> Result<tb_camera::ActiveModel, DbErr> {
    let mut c: ActiveModel = Default::default();
    let seq = data.get("cam_seq");
    let mut data = data.clone();
    if seq == None {
      let v: serde_json::Value = 1i32.into();
      //*data.pointer_mut("/cam_seq").unwrap() = v;
      data["cam_seq"] = v;
    }
    c.set_from_json(data.clone()).unwrap();
    if seq == None {
      c.not_set(tb_camera::Column::CamSeq);
    } else {
      let v = seq.unwrap().as_i64().unwrap() as i32;
      c.set(tb_camera::Column::CamSeq, sea_orm::Value::Int(Some(v)));
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
      c.cam_seq = Set(v["cam_seq"].as_i64().unwrap() as i32);
      c.disp_seq = Set(Some(v["disp_seq"].as_i64().unwrap() as i32));
      let r = c.update(db).await;
      if let Err(e) = r.as_ref() {
        log::error!("db error {e:?}");
      }
    }

    Ok(())
  }

  pub async fn save_stat(db: &DbConn, seq: i32, stat: CamStat) -> Result<tb_camera::Model, DbErr> {
    let mut c: ActiveModel = Default::default();
    let local: DateTime<Local> = Local::now();
    c.cam_seq = Set(seq);
    c.cam_stat = Set(Some(stat.to_string()));
    c.cam_stat_dt = Set(Some(local.naive_local()));
    let rlt = c.update(db).await;
    if let Err(e) = rlt.as_ref() {
      log::error!("db error {e:?}");
    }

    rlt
  }

  pub async fn delete_camera(db: &DbConn, seq: i32) -> Result<DeleteResult, DbErr> {
    let model: ActiveModel = TbCamera::find_by_id(seq)
      .one(db)
      .await?
      .ok_or(DbErr::Custom("Cannot find data.".to_owned()))
      .map(Into::into)?;

    model.delete(db).await
  }
}
