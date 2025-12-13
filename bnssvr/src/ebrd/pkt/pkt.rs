#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Cmd {
  Id = 0x10,
  Time = 0x03,
  ErrorRes = 0x08,
  EnvDev = 0x0e,
  RoomInfo = 0x11,
  RoomSendEnd = 0x13,
  RoomDel = 0x14,
  RoomDelAll = 0x15,
  OperNightTime = 0xd1,
}

impl Cmd {
  pub fn as_u8(&self) -> u8 {
    *self as u8
  }
}

impl TryFrom<u8> for Cmd {
  type Error = &'static str;

  fn try_from(value: u8) -> Result<Self, Self::Error> {
    match value {
      0x10 => Ok(Cmd::Id),
      0x03 => Ok(Cmd::Time),
      0x08 => Ok(Cmd::ErrorRes),
      0x0e => Ok(Cmd::EnvDev),
      0x11 => Ok(Cmd::RoomInfo),
      0x13 => Ok(Cmd::RoomSendEnd),
      0x14 => Ok(Cmd::RoomDel),
      0x15 => Ok(Cmd::RoomDelAll),
      0xd1 => Ok(Cmd::OperNightTime),
      _ => Err("Invalid command value"),
    }
  }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CtlChar {
  Stx = 0x02,
  Etx = 0x03,
}

impl CtlChar {
  pub fn as_u8(&self) -> u8 {
    *self as u8
  }
}

impl TryFrom<u8> for CtlChar {
  type Error = &'static str;

  fn try_from(value: u8) -> Result<Self, Self::Error> {
    match value {
      0x02 => Ok(CtlChar::Stx),
      0x03 => Ok(CtlChar::Etx),
      _ => Err("Invalid control character value"),
    }
  }
}

/*
| 명령어 | 설명                     | 내용                                  |
| ------ | ------------------------ | ------------------------------------- |
| 0x10   | ID                       | 최초접속시 전광판모뎀번호             |
| 0x03   | 시간전송                 | 시간동기화 ( 상태확인시에도 전송)     |
| 0x08   | 수신정보 이상            | 자료처리중 오류 발생알림              |
| 0x0e   | 환경감시기 동작제어      |                                       |
| 0x0e   | 환경감시기 상태요구      |                                       |
| 0x11   | 방정보 전송              | 표출할 자료의 표출설정 전송           |
| 0x13   |                          | 방정보 전송 완료                      |
| 0x14   | 방정보 삭제              | 표출목록에서 방번호의 표출정보를 삭제 |
| 0x15   | 전체 삭제                | 표출중인 메시지 전체 삭제             |
| 0xd1   | 야간시간 및 동작시간설정 | 전광판 On/Off 시간과 밝기정보 전송    |
*/

/*
통신 신전문
| 종류   | 길이 | 신   | 데이터유형 | 내용(신)                          |
| ------ | ---- | ---- | ---------- | --------------------------------- |
| STX    | 1    | 1    | hex        | 0x02                              |
| LEN    | 2    | 3    | hex        | CMD ~ 체크섬까지 길이             |
| CMD    | 1    | 4    | hex        | 명령어 코드번호                   |
| ID     | 12   | 16   | char       | 모뎀번호                          |
| DATA   | N    | 16+N | char       | 데이터                            |
| 체크섬 | 1    | 17+N | hex        | LEN에서 ID까지의 합 중 LOW 1 byte |
| ETX    | 1    | 18*N | hex        | 0x03                              |
*/

#[derive(Debug)]
pub struct Pkt {
  pub stx: CtlChar,
  pub len: u16,
  pub cmd: Cmd,
  pub id: String,
  pub data: Vec<u8>,
  pub checksum: u8,
  pub etx: CtlChar,
}

impl Pkt {
  pub fn new() -> Self {
    Self {
      stx: CtlChar::Stx,
      len: 0,
      cmd: Cmd::Id,
      id: "".to_string(),
      data: vec![],
      checksum: 0,
      etx: CtlChar::Etx,
    }
  }
}
