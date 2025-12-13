export class TbBookMark {
  bm_seq?: number;
  bm_lat?: number;
  bm_lng?: number;
  bm_zoom?: number;
  bm_nm?: string;
}

export interface IfTbBookMark extends TbBookMark {}
