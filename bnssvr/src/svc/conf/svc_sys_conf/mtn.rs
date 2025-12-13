use crate::entities::prelude::TbSysConf;
use crate::entities::{tb_sys_conf, tb_sys_conf::ActiveModel};
use sea_orm::*;

pub struct Mtn;

impl Mtn {
  pub async fn save(db: &DbConn, mut data: serde_json::Value) -> Result<tb_sys_conf::Model, DbErr> {
    let mut c: ActiveModel = Default::default();
    data["sys_conf_id"] = "SYS".into();
    c.set_from_json(data.clone()).unwrap();
    c.set(
      tb_sys_conf::Column::SysConfId,
      sea_orm::Value::String(Some(Box::from("SYS".to_string()))),
    );
    log::info!("c is bef {:?}", c);

    if c.login_logo_file_seq.is_not_set() {
      c.login_logo_file_seq = Set(None);
    }
    if c.logo_file_seq.is_not_set() {
      c.logo_file_seq = Set(None);
    }

    log::info!("c is aft {:?}", c);
    //c.reset_all();

    match TbSysConf::find_by_id("SYS").one(db).await {
      Ok(Some(_ele)) => c.update(db).await,
      Ok(None) => c.insert(db).await,
      Err(e) => Err(e),
    }
  }
}
