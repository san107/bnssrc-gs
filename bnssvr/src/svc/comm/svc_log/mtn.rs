use crate::{
  entities::{prelude::*, tb_log},
  syslog::Syslog,
};
use chrono::Local;
use sea_orm::*;

#[allow(dead_code)]
pub struct Mtn;
impl Mtn {
  pub async fn insert(db: &DbConn, syslog: Syslog) -> Result<InsertResult<tb_log::ActiveModel>, DbErr> {
    let mut am: tb_log::ActiveModel = Default::default();

    /*
    pub struct Model {
      #[sea_orm(primary_key)]
      pub log_seq: i32,
      pub user_id: String,
      pub log_level: String,
      pub log_msg: String,
      pub log_data_json: String,
      pub log_dt: DateTime,
      pub log_type: String,
    }
    */

    am.user_id = Set(syslog.user_id);
    am.log_level = Set(syslog.lvl.to_string());
    am.log_msg = Set(syslog.msg);
    am.log_data_json = Set(syslog.json.to_string());
    am.log_type = Set(syslog.lty.to_string());
    am.log_dt = Set(Local::now().naive_local());

    TbLog::insert(am).exec(db).await
  }
}
