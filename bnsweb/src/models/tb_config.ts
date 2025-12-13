export class TbConfig {
  grp_id?: string;
  def_lat?: number;
  def_lng?: number;
  def_zoom?: number;
}

export interface IfTbConfig extends TbConfig {}

export class SvrInfo {
  build_time?: string;
  sms_enable?: boolean;
}

export interface IfSvrInfo extends SvrInfo {}
