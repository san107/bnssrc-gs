export class TbEmcall {
  emcall_seq?: number;
  emcall_id?: string;
  emcall_lat?: number;
  emcall_lng?: number;
  emcall_nm?: string;
  cam_seq?: number;
  // emcall_ip?: string;
  // emcall_port?: number;
  comm_stat?: string;
  emcall_type?: string;
  grp_id?: string;
  emcall_grp_seq?: number;
}

export interface IfTbEmcall extends TbEmcall {}
