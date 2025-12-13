export class TbEbrdMsgMap {
  ebrd_seq?: number;
  ebrd_msg_pos?: number;
  ebrd_msg_seq?: number;
  send_stat?: string;
  send_rslt?: string;
  send_dt?: string;
}

export interface IfTbEbrdMsgMap extends TbEbrdMsgMap {}
