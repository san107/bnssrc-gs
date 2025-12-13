export class TbGateHist {
  gate_hist_seq?: number;
  gate_seq?: number;
  gate_stat?: 'UpOk' | 'DownOk' | 'Stop' | 'Na';
  cmd_rslt?: 'Success' | 'Fail';
  cmd_rslt_msg?: string;
  cmd_req?: 'Stat' | 'Up' | 'Down'; // 처리요청구분.
  update_dt?: string;
}

export interface IfTbGateHist extends TbGateHist {}
