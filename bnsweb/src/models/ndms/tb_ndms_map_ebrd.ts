export class TbNdmsMapEbrd {
  flcode?: string;
  cd_dist_board?: number;
  ebrd_seq?: number;
}

export interface IfTbNdmsMapEbrd extends TbNdmsMapEbrd {}

export const getTbNdmsMapEbrdKey = (o?: TbNdmsMapEbrd): string => {
  if (!o) return '';
  return '' + o.flcode + o.cd_dist_board;
};
