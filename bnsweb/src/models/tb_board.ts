export class TbBoard {
  bd_seq?: number;
  disp_seq?: number;
  bd_title?: string;
  bd_contents?: string;
  bd_create_dt?: string;
  bd_update_dt?: string;
  bd_views?: number;
  bd_type?: string;
  user_id?: string;
  file_seq?: number;
}

export interface IfTbBoard extends TbBoard {}
