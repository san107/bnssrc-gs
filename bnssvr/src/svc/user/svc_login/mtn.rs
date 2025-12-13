use crate::entities::prelude::*;
use crate::entities::tb_login::{self, ActiveModel};
use bcrypt::{hash, DEFAULT_COST};
use sea_orm::ActiveValue::NotSet;
use sea_orm::{ActiveModelTrait, DbConn, DbErr, DeleteResult, EntityTrait};
use serde_json::json;

#[allow(dead_code)]
pub struct Mtn;
impl Mtn {
  #[allow(dead_code)]
  pub async fn save(db: &DbConn, data: serde_json::Value) -> Result<tb_login::Model, DbErr> {
    // let mut c: ActiveModel = Default::default();

    let pass_update = data.get("user_pass").is_some();

    let mut data = data.clone();

    // 패스워드 업데이트
    if pass_update {
      // 패스워드를 업데이트할 것.
      let p = data.get("user_pass").unwrap().as_str().unwrap();
      let p = format!("{}{}", data.get("user_role").unwrap().as_str().unwrap(), p);
      let hash = hash(&p, DEFAULT_COST).unwrap();
      *data.get_mut("user_pass").unwrap() = json!(hash);
    } else {
      // 오류나지 않도록 패스워드 설정.
      data["user_pass"] = json!("");
    }

    // c.set_from_json(data).expect("Fail Json to Model");
    log::debug!("data is {data:?}");
    let mut c = ActiveModel::from_json(data.clone()).expect("Fail Json to Model");
    if !pass_update {
      c.user_pass = NotSet;
    }

    let key = data.get("user_id").unwrap().as_str().unwrap();
    let model = TbLogin::find_by_id(key).one(db).await?;

    match model {
      Some(_model) => c.update(db).await,
      None => c.insert(db).await,
    }
  }

  #[allow(dead_code)]
  pub async fn delete(db: &DbConn, key: &str) -> Result<DeleteResult, DbErr> {
    let model: ActiveModel = TbLogin::find_by_id(key)
      .one(db)
      .await?
      .ok_or(DbErr::Custom("Cannot find Record".to_owned()))
      .map(Into::into)?;
    model.delete(db).await
  }
}
