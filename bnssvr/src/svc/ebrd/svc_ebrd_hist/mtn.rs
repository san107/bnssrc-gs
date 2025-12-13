use crate::entities::tb_ebrd_hist;
use chrono::Local;
use sea_orm::*;

#[allow(dead_code)]
pub struct Mtn;
impl Mtn {
  pub async fn insert(
    db: &DbConn,
    seq: i32,
    id: &str,
    comm_stat: &str,
    cmd_rslt: &str,
    cmd_rslt_cd: Option<i32>,
    json: serde_json::Value,
  ) -> Result<tb_ebrd_hist::Model, DbErr> {
    let mut e: tb_ebrd_hist::ActiveModel = Default::default();

    let json = serde_json::to_string(&json).map_err(|e| DbErr::Custom(format!("json error: {:?}", e)))?;

    e.ebrd_seq = Set(seq);
    e.ebrd_id = Set(id.to_string());
    e.comm_stat = Set(comm_stat.to_string());
    e.cmd_rslt = Set(Some(cmd_rslt.to_string()));
    e.cmd_rslt_cd = Set(cmd_rslt_cd);
    e.json = Set(json);
    e.update_dt = Set(Local::now().naive_local());

    e.insert(db).await
  }
}
