export class TbSysConf {
  sys_conf_id?: string;
  login_logo_file_seq?: number;
  logo_file_seq?: number;
  api_key_weather?: string;
  api_key_map?: string;
  url_offline_map?: string;
  use_offline_map_yn?: string;
  use_water_yn?: string;
  use_ebrd_yn?: string;
  use_emcall_yn?: string;
  use_emcall_grp_yn?: string;
  use_gate_yn?: string;
  use_camera_yn?: string;
  use_weather_yn?: string;
  use_ndms_yn?: string;
  use_rtsp_svr_yn?: string;
  rtsp_svr_ip_port?: string;
  // use_sms_yn?: string; // 테이블필드는 있으나 사용하지 않음. useSvrConf 의 sms_enable 대체사용함.
}

export interface IfTbSysConf extends TbSysConf {}
