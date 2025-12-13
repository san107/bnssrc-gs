use crate::entities::{
  prelude::*,
  tb_gate_ebrd::{self, ActiveModel},
};

//use log::info;
use sea_orm::*;
//use sea_query::OnConflict;

pub struct Mtn;
impl Mtn {
  pub async fn saves(db: &DbConn, data: serde_json::Value) -> Result<InsertResult<ActiveModel>, DbErr> {
    let mut models: Vec<ActiveModel> = vec![];

    // 트랜잭션 처리할 것.
    // 우선 alm_user_seq 를 기준으로 삭제하도록.
    let seq = data.get("gateSeq");
    let seq = seq.unwrap().as_i64().unwrap() as i32;

    TbGateEbrd::delete_many()
      .filter(tb_gate_ebrd::Column::GateSeq.eq(seq))
      .exec(db)
      .await
      .unwrap();

    if let serde_json::Value::Array(arr) = &data["list"] {
      for v in arr {
        let mut c: ActiveModel = Default::default();
        let gate_seq = v["gate_seq"].as_i64().unwrap() as i32;
        let ebrd_seq = v["ebrd_seq"].as_i64().unwrap() as i32;

        c.set(tb_gate_ebrd::Column::GateSeq, sea_orm::Value::Int(Some(gate_seq)));
        c.set(tb_gate_ebrd::Column::EbrdSeq, sea_orm::Value::Int(Some(ebrd_seq)));
        models.push(c);
      }
    }
    if models.len() == 0 {
      // 저장할 데이터가 없는 경우에도, 모든 데이터를 삭제하였으므로 성공으로 간주한다.
      return Ok(InsertResult { last_insert_id: (0, 0) });
    }

    TbGateEbrd::insert_many(models)
      //.on_conflict(OnConflict::new().do_nothing().to_owned())
      .exec(db)
      .await
  }
}
