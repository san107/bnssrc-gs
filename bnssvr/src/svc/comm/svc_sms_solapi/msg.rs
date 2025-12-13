use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize)]
#[sea_orm(schema_name = "ldms_sms", table_name = "msg")]
pub struct Model {
  #[sea_orm(primary_key)]
  pub id: i32,
  #[sea_orm(column_name = "createdAt")]
  pub created_at: DateTime,
  #[sea_orm(column_name = "updatedAt")]
  pub updated_at: DateTime,
  #[sea_orm(column_name = "scheduledAt")]
  pub scheduled_at: DateTime,
  #[sea_orm(column_name = "sendAttempts")]
  pub send_attempts: i16,
  #[sea_orm(column_name = "reportAttempts")]
  pub report_attempts: i16,
  pub to: Option<String>,
  pub from: Option<String>,
  #[sea_orm(column_name = "groupId")]
  pub group_id: Option<String>,
  #[sea_orm(column_name = "messageId")]
  pub message_id: Option<String>,
  pub status: Option<String>,
  #[sea_orm(column_name = "statusCode")]
  pub status_code: Option<String>,
  #[sea_orm(column_name = "statusMessage")]
  pub status_message: Option<String>,
  pub payload: Option<Json>,
  pub result: Option<Json>,
  pub sent: i8,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
