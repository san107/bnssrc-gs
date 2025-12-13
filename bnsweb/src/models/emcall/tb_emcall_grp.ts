export class TbEmcallGrp {
  emcall_grp_seq?: number;
  emcall_grp_nm?: string;
  comm_stat?: string;
  emcall_tts_msg?: string;
  emcall_type?: string;
  grp_id?: string;
  disp_seq?: number;
  emcall_grp_id?: string;
  emcall_grp_stat_json?: string;
  emcall_grp_ip?: string;
  emcall_grp_port?: number;
  emcall_grp_lng?: number | null;
  emcall_grp_lat?: number | null;
  cam_seq?: number | null;
}

export interface IfTbEmcallGrp extends TbEmcallGrp {}

export class ItgStat {
  device_id?: string = '';
  msg?: string = 'Off';
  light?: string = 'Off';
  speaker?: string = 'Off';
  speaker_tts?: string = 'Off';
  tts_msg?: string = '';
}

export class ItgStatWrap {
  emcall_grp_seq?: number = -1;
  user_id?: string = '';
  stat?: ItgStat = new ItgStat();
}

export interface IfItgStat extends ItgStat {}
export interface IfItgStatWrap extends ItgStatWrap {}
