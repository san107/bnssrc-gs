export class TbEbrd {
  ebrd_seq?: number;
  ebrd_id?: string;
  ebrd_lat?: number;
  ebrd_lng?: number;
  ebrd_nm?: string;
  ebrd_ip?: string;
  ebrd_port?: number;
  comm_stat?: string;
  ebrd_type?: string;
  ebrd_size_w?: number;
  ebrd_size_h?: number;
  brght_day_lvl?: number = 0;
  brght_night_lvl?: number = 0;
  ebrd_desc?: string;
  day_time_start?: string = '0000';
  day_time_end?: string = '0000';
  on_time_start?: string = '0000';
  on_time_end?: string = '0000';
  send_yn?: string = 'N';
  ebrd_weather_msg?: string;
  ebrd_event?: (string & {}) | 'EMER_START' | 'EMER_END';
  ebrd_emer_msg_pos?: number = 0;
  grp_id?: string;
  cam_seq?: number;
}

export interface IfTbEbrd extends TbEbrd {}
