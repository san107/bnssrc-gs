use downcast_rs::{impl_downcast, DowncastSync};
use std::fmt::Debug;
use tokio::sync::oneshot;

use crate::ebrd::cmds::{cmd_oper_night_time::CmdOperNightTime, cmd_room_info::CmdRoomInfo};

pub trait EbrdBase: DowncastSync + Debug {}
impl_downcast!(EbrdBase);

//#[derive(Deserialize, Serialize, Debug)] // oneshot 때문에 할 수 없음.
#[derive(Debug)]
#[allow(dead_code)]
pub struct EbrdWebTime {
  pub ebrd_seq: i32,
  pub grp_id: String,
  pub user_id: String,
  pub tx: Option<oneshot::Sender<Result<(), String>>>,
}

impl EbrdBase for EbrdWebTime {}

#[derive(Debug)]
#[allow(dead_code)]
pub struct EbrdWebRoomDel {
  pub ebrd_seq: i32,
  pub ebrd_msg_pos: u8,
  pub grp_id: String,
  pub user_id: String,
  pub tx: Option<oneshot::Sender<Result<(), String>>>,
}

impl EbrdBase for EbrdWebRoomDel {}

#[derive(Debug)]
#[allow(dead_code)]
pub struct EbrdWebRoomDelAll {
  pub ebrd_seq: i32,
  pub grp_id: String,
  pub user_id: String,
  pub tx: Option<oneshot::Sender<Result<(), String>>>,
}

impl EbrdBase for EbrdWebRoomDelAll {}

#[derive(Debug)]
#[allow(dead_code)]
pub struct EbrdWebOperNightTime {
  pub ebrd_seq: i32,
  pub grp_id: String,
  pub user_id: String,
  pub cmd: CmdOperNightTime,
  pub tx: Option<oneshot::Sender<Result<(), String>>>,
}

impl EbrdBase for EbrdWebOperNightTime {}

#[derive(Debug)]
#[allow(dead_code)]
pub struct EbrdWebRoomInfo {
  pub ebrd_seq: i32,
  pub grp_id: String,
  pub user_id: String,
  pub cmd: CmdRoomInfo,
  pub tx: Option<oneshot::Sender<Result<(), String>>>,
}

impl EbrdBase for EbrdWebRoomInfo {}
