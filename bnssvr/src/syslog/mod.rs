use serde::{Deserialize, Serialize};

pub mod app;
pub mod txlog;

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, strum::Display, strum::EnumString)]
pub enum LogLevel {
  Debug,
  Info,
  Warn,
  Error,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, strum::Display, strum::EnumString)]
pub enum LogType {
  Comm,
  EbrdEvt,
}

#[allow(dead_code)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Syslog {
  pub user_id: String,
  pub lvl: LogLevel,
  pub msg: String,
  pub json: serde_json::Value,
  pub lty: LogType,
}

impl Default for Syslog {
  fn default() -> Self {
    Self {
      user_id: String::new(),
      lvl: LogLevel::Info,
      msg: String::new(),
      json: serde_json::json!({}),
      lty: LogType::Comm,
    }
  }
}
