export type WaterStat = 'Unknown' | 'Norm' | 'Attn' | 'Warn' | 'Alert' | 'Crit';
export type WaterType = 'Istec' | 'ItgOnoff' | 'HpOnoff' | 'HpAnalog' | 'YesungWg';

//export const WaterOnoffTypes: (WaterType | undefined)[] = ['ItgOnoff', 'HpOnoff'];
export const WaterDataFromHpTypes: (WaterType | undefined)[] = ['HpOnoff', 'HpAnalog', 'YesungWg'];
export class TbWater {
  water_seq?: number;
  water_dev_id?: string;
  water_gate_seq?: number | null;
  water_lat?: number;
  water_lng?: number;
  water_mod?: string;
  cam_seq?: number;
  water_nm?: string;
  limit_attn?: number;
  limit_warn?: number;
  limit_alert?: number;
  limit_crit?: number;
  water_type?: WaterType;
  water_level?: number;
  water_dt?: string; // 마지막 수위 측정 시간
  water_stat?: WaterStat;
  comm_stat?: 'Unknown' | 'Ok' | 'Err'; // 5분 이상 데이터 없으면 오류로 처리 예정.
  grp_id?: string;
}

export interface IfTbWater extends TbWater { }
