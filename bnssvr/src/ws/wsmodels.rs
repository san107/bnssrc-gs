use crate::{
  models::cd::{CommStat, GateCmdRsltType, GateStatus},
  rtsp::stat_mgr::CamStat,
};
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Debug, strum::Display, strum::EnumString, Copy, Clone)]
pub enum WsCmd {
  WaterEvt, // 수위계 이벤트.
  WaterSave,
  WaterDel,
  WaterStat,
  WaterGrpStat,
  WaterGrpAction, //
  GateSave,
  GateDel,
  GateStat,   // 게이트 상태 변화.( 상태 및 처리 결과가 가야함. ) ==> 어차피, gate_hist 에 저장되므로, 이 형식으로 처리.
  CameraStat, // 카메라 상태 변화시.
  CameraSave,
  CameraDel,
  EmcallEvt,
  EmcallStat,
  EbrdStat,
  Test,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct WsMsg<T> {
  pub cmd: WsCmd,
  pub data: T,
}

#[derive(Clone, Copy, Debug, Serialize, Deserialize, strum::Display, strum::EnumString)]
pub enum GrpStat {
  Ok,
  CommErr,
  Warn,
  Crit,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct WsWaterGrpStat {
  pub water_grp_id: String,
  pub grp_stat: GrpStat,
}
#[derive(Clone, Copy, Debug, Serialize, Deserialize, strum::Display, strum::EnumString, PartialEq)]
pub enum GrpAction {
  Autodown,
  Down,
  Stop,
  Close,
  Unknown,
  None,
}
#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct WsWaterGrpAction {
  pub water_grp_id: String,
  pub grp_action: GrpAction,
}
#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct WsWaterStat {
  pub water_seq: i32,
  pub comm_stat: CommStat,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct WsCameraStat {
  pub cam_seq: i32,
  pub cam_stat: CamStat,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct WsGateStat {
  pub gate_seq: i32,
  pub gate_stat: GateStatus,
  pub cmd_rslt: GateCmdRsltType,
  pub msg: String,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct WsEbrdStat {
  pub ebrd_seq: i32,
  pub ebrd_id: String,
  pub comm_stat: String,
  pub cmd_rslt: String,
  pub cmd_rslt_cd: Option<i32>,
  pub msg: String,
}
impl Default for WsEbrdStat {
  fn default() -> Self {
    Self {
      ebrd_seq: -1,
      ebrd_id: String::new(),
      comm_stat: String::new(),
      cmd_rslt: String::new(),
      cmd_rslt_cd: None,
      msg: String::new(),
    }
  }
}
