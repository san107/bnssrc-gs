use crate::entities::tb_gate;
use crate::gate_app::doori::pkt::{DooriAutoMan, DooriRemLoc, DooriWindMode};
use crate::models::cd::{ElockStatus, GateCmdRsltType, GateCmdType, GateStatus};
use downcast_rs::{impl_downcast, DowncastSync};
use serde::Serialize;
use std::fmt::{self, Debug};

pub trait IfGateCmd: Send + Debug + DowncastSync {}
impl_downcast!(sync IfGateCmd); // `sync` => also produce `Arc` downcasts.

#[derive(Debug, Clone)]
pub struct GateCmd {
  pub cmd_type: GateCmdType,
  pub gate_seq: i32,
  pub tx_api: Option<tokio::sync::mpsc::Sender<Box<dyn IfGateCmdRes>>>, // autodown 인 경우, tx_api 가 없을 수 있음.
  pub msg: Option<String>,                                              // 자동차단시에, 수위, 차단조건의 부가정보 전달.
}
impl fmt::Display for GateCmd {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(
      f,
      "GateCmd {{ cmd_type: {:?}, gate_seq: {}, msg: {:?} }}",
      self.cmd_type, self.gate_seq, self.msg
    )
  }
}
impl IfGateCmd for GateCmd {}

#[derive(Debug, Clone)]
pub struct GateCmdGateDown {
  pub gate_seq: i32,
  pub gate: tb_gate::Model,
}

impl IfGateCmd for GateCmdGateDown {}

#[derive(Debug, Clone)]
pub struct GateCmdGateAutoDown {
  pub gate_seq: i32,
  pub gate: tb_gate::Model,
}

impl IfGateCmd for GateCmdGateAutoDown {}

// #[derive(Debug, Clone, Serialize)]
// pub struct GateStatusInfo {
//   pub gate_seq: i32,
//   pub gate_status: GateStatus,
// }

pub trait IfGateCmdRes: Send + Debug + DowncastSync {}
impl_downcast!(sync IfGateCmdRes); // `sync` => also produce `Arc` downcasts.

#[derive(Debug, Clone, Serialize)]
pub struct GateCmdRes {
  pub cmd_res: GateCmdRsltType,
  pub cmd_res_msg: String,
  pub gate_status: GateStatus,
}
impl IfGateCmdRes for GateCmdRes {}

#[derive(Debug, Clone, Serialize)]
pub struct GateCmdResItson {
  pub cmd_res: GateCmdRsltType,
  pub cmd_res_msg: String,
  pub gate_status: GateStatus,
  pub elock_status: ElockStatus,
}

impl IfGateCmdRes for GateCmdResItson {}

#[derive(Debug, Clone, Serialize)]
pub struct IfGateCmdResDoori {
  pub cmd_res: GateCmdRsltType,
  pub cmd_res_msg: String,
  pub gate_status: GateStatus,
  pub auto_man: DooriAutoMan,
  pub rem_loc: DooriRemLoc,
  pub wind_mode: DooriWindMode,
}

impl Default for IfGateCmdResDoori {
  fn default() -> Self {
    Self {
      cmd_res: GateCmdRsltType::Fail,
      cmd_res_msg: String::new(),
      gate_status: GateStatus::Na,
      auto_man: DooriAutoMan::Na,
      rem_loc: DooriRemLoc::Na,
      wind_mode: DooriWindMode::Na,
    }
  }
}

impl IfGateCmdRes for IfGateCmdResDoori {}
