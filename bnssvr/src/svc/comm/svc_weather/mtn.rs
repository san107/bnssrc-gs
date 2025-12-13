use crate::entities::tb_weather;
use crate::entities::tb_weather::ActiveModel;
use sea_orm::DbConn;
use sea_orm::*;

pub struct Mtn;

impl Mtn {
  pub async fn save(db: &DbConn, data: serde_json::Value) -> Result<tb_weather::ActiveModel, DbErr> {
    let mut e: ActiveModel = Default::default();
    let seq = data.get("wt_seq");
    let mut data = data.clone();

    if seq == None {
      let v: serde_json::Value = 0.into();
      data["wt_seq"] = v;
    }

    e.set_from_json(data.clone()).unwrap();

    if seq == None {
      e.not_set(tb_weather::Column::WtSeq);
    } else {
      let v = seq.unwrap().as_i64().unwrap() as i32;
      e.set(tb_weather::Column::WtSeq, sea_orm::Value::Int(Some(v)));
    }

    e.save(db).await
  }

  pub async fn delete(db: &DbConn, seq: i32) -> Result<DeleteResult, DbErr> {
    let rec = tb_weather::Entity::find_by_id(seq).one(db).await?;
    if let Some(rec) = rec {
      rec.delete(db).await
    } else {
      Err(DbErr::RecordNotFound(format!("emcall not found: {}", seq)))
    }
  }

  pub async fn update_disp_seqs(db: &DbConn, data: serde_json::Value) -> Result<(), DbErr> {
    let list = data.as_array();
    if list == None {
      return Err(DbErr::Custom("Invalid data.".to_owned()));
    }
    let list = list.unwrap();
    for v in list {
      let mut c: ActiveModel = Default::default();
      c.wt_seq = Set(v["wt_seq"].as_i64().unwrap() as i32);
      c.disp_seq = Set(Some(v["disp_seq"].as_i64().unwrap() as i32));
      let r = c.update(db).await;
      if let Err(e) = r.as_ref() {
        log::error!("db error {e:?}");
      }
    }

    Ok(())
  }
}
