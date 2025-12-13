export class TbNCd {
  ncd_grp: string = '';
  ncd_id: string = '';
  ncd_nm: string = '';
  ncd_seq: number = 0;
}

export interface IfTbNCd extends TbNCd {}

export const ncd_key = (ncd?: IfTbNCd) => {
  if (!ncd) return '';
  return `${ncd.ncd_grp}:${ncd.ncd_id}`;
};
