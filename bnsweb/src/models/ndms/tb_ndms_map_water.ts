export class TbNdmsMapWater {
  flcode?: string;
  cd_dist_wal?: number;
  water_seq?: number;
}

export interface IfTbNdmsMapWater extends TbNdmsMapWater {}
export const getTbNdmsMapWaterKey = (o?: TbNdmsMapWater): string => {
  if (!o) return '';
  return '' + o.flcode + o.cd_dist_wal;
};
