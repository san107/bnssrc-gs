use serde::{Deserialize, Serialize};

#[derive(Debug, PartialEq, Clone, Copy, strum::Display, strum::EnumString)]
pub enum GateType {
  Autogate,
  Itson,
  Hpsys,
  HpsysCrtn,
  Hngsk,
  Doori,
  Fptech,
  Sysbase,
  Realsys,
  Yesung,
}

#[derive(Clone, Copy, Debug, Serialize, Deserialize, strum::Display, strum::EnumString, PartialEq, PartialOrd)]
pub enum WaterStat {
  Unknown,
  Norm,
  Attn,
  Warn,
  Alert,
  Crit,
}

#[derive(Clone, Copy, Debug, Serialize, Deserialize, strum::Display, strum::EnumString)]
pub enum CommStat {
  Unknown,
  Ok,
  Err,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, strum::Display, strum::EnumString)]
#[allow(dead_code)]
pub enum GateCmdRsltType {
  Success,
  Fail,
  ModeErr, // 모드가 잘못된 경우( 자동/수동, 원격/로컬 )
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, strum::Display, strum::EnumString)]
pub enum DoGateCmdRslt {
  Success,
  Same,
}

#[derive(Debug, Copy, Clone, Serialize, PartialEq, strum::Display, strum::EnumString)]
pub enum GateCmdType {
  Up,
  UpAsync,
  Down,
  DownAsync,
  AutoDown, // 자동 차단 사용시에 사용예정.
  Stat,
  Stop,
  ELock,   // itson - 전기정
  EUnLock, // itson - 전기정
  Wind,    // doori - 바람 모드 변경( On, Off 로 msg 에 설정하여 전달하도록 한다. )
  Side,    // Hpsys - 갓길.
  Center,  // Hpsys - 중앙.
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, strum::Display, strum::EnumString)]
pub enum GateStatus {
  UpOk,
  UpLock,
  UpAction,
  DownOk,
  DownAction,
  DownLock, // 사용하지 않음.
  Moving,
  Na,
  Fault,
  Stop,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, strum::Display, strum::EnumString)]
pub enum ElockStatus {
  Lock,
  UnLock,
  Na,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, strum::Display, strum::EnumString)]
pub enum WaterMod {
  Grp,
  Def,
}
