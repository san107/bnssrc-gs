/*
  pub emcall_evt_hist_seq: i32,
  pub emcall_id: String,
  pub comm_stat: String,
  pub emcall_evt_type: String,
  pub emcall_evt_dt: DateTime,
*/

export class TbEmcallEvtHist {
  emcall_evt_hist_seq?: number;
  emcall_id?: string;
  comm_stat?: string;
  emcall_evt_type?: string;
  emcall_evt_dt?: string;
}

export interface IfTbEmcallEvtHist extends TbEmcallEvtHist {}
export interface IfWsEmcallEvt extends TbEmcallEvtHist {}
