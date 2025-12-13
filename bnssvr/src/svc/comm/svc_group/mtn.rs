use crate::entities::prelude::*;
use crate::entities::{tb_group, tb_group::ActiveModel};
use crate::entities::{tb_group_el, tb_group_el::Column};
use log::info;
use sea_orm::*;

#[allow(dead_code)]
pub struct Mtn;
impl Mtn {
  pub async fn save_group(db: &DbConn, data: serde_json::Value) -> Result<tb_group::ActiveModel, DbErr> {
    let mut c: ActiveModel = Default::default();
    let seq = data.get("grp_seq");
    let mut data = data.clone();
    if seq == None {
      let v: serde_json::Value = 1i32.into();
      //*data.pointer_mut("/cam_seq").unwrap() = v;
      data["grp_seq"] = v;
    }
    c.set_from_json(data.clone()).unwrap();
    if seq == None {
      c.not_set(tb_group::Column::GrpSeq);
    } else {
      let v: i32 = seq.unwrap().as_i64().unwrap() as i32;
      c.set(tb_group::Column::GrpSeq, sea_orm::Value::Int(Some(v)));
    }

    c.save(db).await
  }

  pub async fn delete_group(db: &DbConn, seq: i32) -> Result<DeleteResult, DbErr> {
    // 그룹 엘레먼트 먼저 삭제
    TbGroupEl::delete_many()
      .filter(Column::GrpSeq.eq(seq))
      .exec(db)
      .await
      .unwrap();

    let model: ActiveModel = TbGroup::find_by_id(seq)
      .one(db)
      .await?
      .ok_or(DbErr::Custom("Cannot find data.".to_owned()))
      .map(Into::into)?;

    model.delete(db).await
  }

  pub async fn save_group_and_el(db: &DbConn, data: serde_json::Value) -> Result<InsertResult<tb_group_el::ActiveModel>, DbErr> {
    let mut c: ActiveModel = Default::default();
    let seq = data.get("grp_seq");
    let nm = data.get("grp_nm");
    let tp = data.get("grp_type");
    let id = data.get("grp_id");

    let mut data = data.clone();
    if seq == None {
      let v: serde_json::Value = 1i32.into();
      let p1 = nm.unwrap().as_str().unwrap().into();
      let p2 = tp.unwrap().as_str().unwrap().into();
      let p3 = id.unwrap().as_str().unwrap().into();

      data["grp_seq"] = v;
      data["grp_name"] = p1;
      data["grp_type"] = p2;
      data["grp_id"] = p3;
      // data["grp_type"] = serde_json::Value::String(tp.unwrap().to_string());
      // data["grp_nm"] = serde_json::Value::String(nm.unwrap().to_string());
    }
    c.set_from_json(data.clone()).unwrap();
    if seq == None {
      c.not_set(tb_group::Column::GrpSeq);
      // c.set(tb_group::Column::GrpType, sea_orm::Value::String(Some(Box::from(tp.to_owned()))));
      // c.set(tb_group::Column::GrpNm, sea_orm::Value::String(Some(Box::from(nm.to_owned()))));
    } else {
      let v: i32 = seq.unwrap().as_i64().unwrap() as i32;
      c.set(tb_group::Column::GrpSeq, sea_orm::Value::Int(Some(v)));
    }
    // c.save(db).await

    // save 후 grp_seq값을 얻어와서 group_el 에 데이터를 입력
    let ret: tb_group::ActiveModel = c.save(db).await.unwrap();
    info!("tb_group info {:?}", ret);
    info!("return seq info {:?}", ret.grp_seq);
    let ret_grp_seq: i32 = ret.grp_seq.unwrap();

    // let mut models: Vec<TbGroupEl> = vec![];
    let mut models: Vec<tb_group_el::ActiveModel> = vec![];
    if let serde_json::Value::Array(arr) = &data["list"] {
      for v in arr {
        let mut c: tb_group_el::ActiveModel = Default::default();
        let grp_seq = ret_grp_seq;
        let grp_el_seq = v["gate_seq"].as_i64().unwrap() as i32;

        let mut datas = v.clone();
        datas["grp_seq"] = grp_seq.into();
        datas["grp_el_seq"] = grp_el_seq.into();

        c.set_from_json(datas.clone()).expect("fail json value to active model");
        c.set(tb_group_el::Column::GrpSeq, sea_orm::Value::Int(Some(grp_seq)));
        c.set(tb_group_el::Column::GrpElSeq, sea_orm::Value::Int(Some(grp_el_seq)));
        models.push(c);
      }
    }
    if models.len() == 0 {
      // 저장할 데이터가 없는 경우에도, 모든 데이터를 삭제하였으므로 성공으로 간주한다.
      return Ok(InsertResult { last_insert_id: (0, 0) });
    }

    TbGroupEl::insert_many(models)
      // .on_conflict(OnConflict::new().do_nothing().to_owned())
      .exec(db)
      .await
  }
}
