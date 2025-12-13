use downcast_rs::{impl_downcast, DowncastSync};
use serde::{Deserialize, Serialize};
use std::fmt::Debug;
use tokio::sync::oneshot;

pub trait EmcallBase: DowncastSync + Debug {}
impl_downcast!(EmcallBase);

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct ItgEvent {
  pub device_id: String,
  pub event_type: String,
  pub s1_status: Option<String>,
  pub b_status: Option<String>,
}

impl EmcallBase for ItgEvent {}

#[derive(Deserialize, Serialize, Debug)]
pub struct ItgEventErr {
  pub device_id: String,
}

impl EmcallBase for ItgEventErr {}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct ItgStat {
  pub device_id: String,
  pub msg: String,         // "On" or "Off"
  pub light: String,       // "On" or "Off"
  pub speaker: String,     // "On" or "Off"
  pub speaker_tts: String, // "On" or "Off"
  pub tts_msg: String,     // tts 메시지
}

impl Default for ItgStat {
  fn default() -> Self {
    Self {
      device_id: String::new(),
      msg: "Off".to_string(),
      light: "Off".to_string(),
      speaker: "Off".to_string(),
      speaker_tts: "Off".to_string(),
      tts_msg: String::new(),
    }
  }
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct ItgStatWrap {
  pub emcall_grp_seq: i32,
  pub user_id: String,
  pub stat: ItgStat,
}

impl EmcallBase for ItgStatWrap {}

#[derive(Debug)]
pub struct ItgStatSend {
  pub wrap: ItgStatWrap,
  pub tx: Option<oneshot::Sender<Result<(), String>>>,
}

impl EmcallBase for ItgStatSend {}

#[derive(Deserialize, Serialize, Debug)]
pub struct ItgStatErr {
  pub emcall_grp_seq: i32,
  pub user_id: String,
  pub device_id: String,
  pub err_msg: String,
}

impl EmcallBase for ItgStatErr {}
