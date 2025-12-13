import { IfTbEbrdMsgMap } from '@/models/ebrd/tb_ebrd_msg_map';
import { dateutil } from '@/utils/date-util';

export class TbEbrdMsg {
  ebrd_msg_seq?: number;
  ebrd_size_w?: number;
  ebrd_size_h?: number;
  ebrd_msg_text?: string;
  ebrd_msg_html?: string;
  ebrd_msg_type?: string = 'Text';
  emerg_yn?: string = 'N';
  sound_yn?: string = 'N';
  file_seq?: number;
  start_dt?: string = dateutil.yyyymmdd(new Date()) + '0000';
  end_dt?: string = dateutil.yyyymmdd(dateutil.addDays(new Date(), 1)) + '2359';
  start_efct?: number = 1;
  end_efct?: number = 5;
  start_spd?: number = 4;
  end_spd?: number = 4;
  start_wait_time?: number = 5;
  repeat_cnt?: number = 1;
  update_user_id?: string;
  update_dt?: string;
}

export interface IfTbEbrdMsg extends TbEbrdMsg {}

export interface IfEbrdMsgInfo extends IfTbEbrdMsg, IfTbEbrdMsgMap {}
