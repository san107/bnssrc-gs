/*
pub struct CmdOperNightTime {
  pub start_hour: u8,
  pub start_minute: u8,
  pub end_hour: u8,
  pub end_minute: u8,
  pub day_biright_level: u8,
  pub night_biright_level: u8,
  pub on_hour: u8,
  pub on_minute: u8,
  pub off_hour: u8,
  pub off_minute: u8,
}
*/

export class CmdOperNightTime {
  start_hour: number = 0;
  start_minute: number = 0;
  end_hour: number = 0;
  end_minute: number = 0;
  day_biright_level: number = 0;
  night_biright_level: number = 0;
  on_hour: number = 0;
  on_minute: number = 0;
  off_hour: number = 0;
  off_minute: number = 0;
}

export interface IfCmdOperNightTime extends CmdOperNightTime {}

/*
pub struct CmdRoomInfo {
  pub room_no: u8,
  pub disp_effect: u8,
  pub disp_effect_speed: u8,
  pub disp_done_wait: u8,
  pub done_effect: u8,
  pub done_effect_speed: u8,
  pub disp_start_dt: String, // YYYYMMDDhhmm
  pub disp_end_dt: String,   // YYYYMMDDhhmm
  pub siren: u8,
  pub msg_type: u8,
  pub msg_seq: i32,
  pub msg_size: i32,
  pub msg_url: String,
}
*/

export class CmdRoomInfo {
  room_no: number = 0;
  disp_effect: number = 0;
  disp_effect_speed: number = 0;
  disp_done_wait: number = 0;
  done_effect: number = 0;
  done_effect_speed: number = 0;
  disp_start_dt: string = '';
  disp_end_dt: string = '';
  siren: number = 0;
  msg_type: number = 0;
  msg_seq: number = 0;
  msg_size: number = 0;
  msg_url: string = '';
}

export interface IfCmdRoomInfo extends CmdRoomInfo {}
