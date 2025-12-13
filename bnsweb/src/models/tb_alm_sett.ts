export class TbAlmSett {
  alm_user_seq?: number;
  water_seq?: number;
  sms_attn_yn?: 'Y' | 'N';
  sms_warn_yn?: 'Y' | 'N';
  sms_alert_yn?: 'Y' | 'N';
  sms_crit_yn?: 'Y' | 'N';
}

export interface IfTbAlmSett extends TbAlmSett {}
