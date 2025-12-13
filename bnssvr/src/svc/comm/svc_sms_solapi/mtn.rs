use std::env;

#[allow(unused_imports)]
pub use super::msg::Entity as Msg;
use super::msg::{ActiveModel, Column};
use sea_orm::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct SmsInfo {
  pub msg: String,
  pub tos: Vec<String>,
}

#[allow(dead_code)]
pub struct Mtn;
impl Mtn {
  // raw SQL example
  // result 를 통해서, Insert된 row의 id를 얻을 수 있다.
  #[allow(dead_code)]
  pub async fn send_sms2(db: &DbConn, from_phone: &str, to_phone: &str, msg: &str) -> Result<ExecResult, DbErr> {
    db.execute(Statement::from_string(
      DatabaseBackend::MySql,
      format!(
        r#"INSERT INTO ldms_sms.msg(payload) VALUES(json_object(
  'to', '{}',
  'from', '{}',
  'text', '{}'
));"#,
        from_phone, to_phone, msg
      ),
    ))
    .await
  }

  /**
   * SMS 전송 : SeaORM 사용
   */
  #[allow(dead_code)]
  pub async fn send_sms(db: &DbConn, from_phone: &str, to_phone: &str, msg: &str) -> Result<ActiveModel, DbErr> {
    let mut c: ActiveModel = Default::default();

    let v = serde_json::json!({
      "to": to_phone,
      "from": from_phone,
      "text": msg,
    });
    c.set(Column::Payload, Value::Json(Some(Box::from(v))));
    c.save(db).await
  }

  pub async fn send_sms_info(db: &DbConn, sms_info: &SmsInfo) -> Result<InsertResult<ActiveModel>, DbErr> {
    let sms_sender_phone = env::var("SMS_SENDER_PHONE").unwrap_or("01094757661".to_owned()); // from 폰.

    let mut models: Vec<ActiveModel> = vec![];
    let sms_msg = &sms_info.msg;

    for to_phone in sms_info.tos.iter() {
      let mut c: ActiveModel = Default::default();
      let v = serde_json::json!({
        "to": to_phone,
        "from": sms_sender_phone,
        "text": sms_msg,
      });
      c.set(Column::Payload, Value::Json(Some(Box::from(v))));
      models.push(c);
    }

    Msg::insert_many(models).exec(db).await
  }
}
