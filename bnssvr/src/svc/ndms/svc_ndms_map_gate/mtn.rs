use crate::entities::tb_ndms_map_gate::ActiveModel;
use crate::entities::tb_ndms_map_gate::Column;
use crate::entities::{prelude::*, tb_ndms_map_gate};
use sea_orm::*;
//use sea_query::OnConflict;

#[allow(dead_code)]
pub struct Mtn;
impl Mtn {
  #[allow(dead_code)]
  pub async fn saves(db: &DbConn, data: serde_json::Value) -> Result<InsertResult<ActiveModel>, DbErr> {
    let mut models: Vec<ActiveModel> = vec![];

    // 트랜잭션 처리할 것.
    // 우선 alm_user_seq 를 기준으로 삭제하도록.
    let flcode = data.get("flcode");
    let flcode = flcode.unwrap().as_str().unwrap();

    TbNdmsMapGate::delete_many()
      .filter(Column::Flcode.eq(flcode))
      .exec(db)
      .await
      .unwrap();

    if let serde_json::Value::Array(arr) = &data["list"] {
      for v in arr {
        let mut c: ActiveModel = Default::default();
        let flcode = v["flcode"].as_str().unwrap();
        let cd_dist_intrcp = v["cd_dist_intrcp"].as_i64().unwrap() as i32;
        c.set_from_json(v.clone()).expect("fail json value to active model");
        c.set(
          tb_ndms_map_gate::Column::Flcode,
          sea_orm::Value::String(Some(Box::from(flcode.to_owned()))),
        );
        c.set(
          tb_ndms_map_gate::Column::CdDistIntrcp,
          sea_orm::Value::Int(Some(cd_dist_intrcp)),
        );
        models.push(c);
      }
    }
    if models.len() == 0 {
      // 저장할 데이터가 없는 경우에도, 모든 데이터를 삭제하였으므로 성공으로 간주한다.
      return Ok(InsertResult {
        last_insert_id: ("".to_owned(), 0),
      });
    }

    //TbNdmsMapGate::insert_many(models).exec(db).await
    TbNdmsMapGate::insert_many(models)
      //.on_conflict(OnConflict::new().do_nothing().to_owned())
      .exec(db)
      .await
  }
}
