use serde::{Deserialize, Serialize};

pub mod cd;

#[derive(Clone, Debug, Serialize, Deserialize, strum::Display, strum::EnumString)]
pub enum WebCmd {
  Ok,
  Err,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct WebRes {
  pub rslt: WebCmd,
  pub msg: String,
}
