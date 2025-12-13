#![allow(unused)]
pub mod cmd_env_dev;
pub mod cmd_env_dev_res;
pub mod cmd_err;
pub mod cmd_id;
pub mod cmd_oper_night_time;
pub mod cmd_res;
pub mod cmd_room_del;
pub mod cmd_room_del_all;
pub mod cmd_room_info;
pub mod cmd_room_send_end;
pub mod cmd_time;

pub use self::cmd_env_dev::*;
pub use self::cmd_env_dev_res::*;
pub use self::cmd_err::*;
pub use self::cmd_id::*;
pub use self::cmd_res::*;
pub use self::cmd_room_del::*;
pub use self::cmd_room_del_all::*;
pub use self::cmd_room_info::*;
pub use self::cmd_room_send_end::*;
pub use self::cmd_time::*;

use thiserror::Error;

#[derive(Debug, Error)]
pub enum Error {
  #[error("Invalid length")]
  InvalidLength,
  #[error("Invalid cmd")]
  InvalidCmd,
}
