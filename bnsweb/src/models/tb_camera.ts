export class TbCamera {
  cam_seq?: number;
  cam_lat?: number;
  cam_lng?: number;
  cam_nm?: string;
  //cam_url?: string;
  cam_ip?: string;
  cam_port?: number;
  cam_user_id?: string;
  cam_pass?: string;
  cam_path_s?: string;
  cam_path_l?: string;
  cam_type?: string;
  cam_stat?: '' | 'Ok' | 'Err';
  cam_stat_dt?: string;
  grp_id?: string;
}

export interface IfTbCamera extends TbCamera {}
