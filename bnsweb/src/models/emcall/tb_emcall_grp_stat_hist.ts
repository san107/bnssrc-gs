/** 
 
  pub emcall_grp_stat_hist_seq: i32,
  pub emcall_grp_id: String,
  pub emcall_grp_stat_json: Option<String>,
  pub emcall_grp_stat_dt: DateTime,
  pub comm_stat: String,
  pub comm_stat_msg: String,
  pub user_id: String,
  pub emcall_sat_dt: DateTime,

 * 
 */

export class TbEmcallGrpStatHist {
  emcall_grp_stat_hist_seq?: number;
  emcall_grp_id?: string;
  emcall_grp_stat_json?: string;
  emcall_grp_stat_dt?: string;
  comm_stat?: string;
  comm_stat_msg?: string;
  user_id?: string;
}

export interface IfTbEmcallGrpStatHist extends TbEmcallGrpStatHist {}
export interface IfWsEmcallGrpStat extends IfTbEmcallGrpStatHist {}
