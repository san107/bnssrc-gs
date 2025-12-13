export class TbLogin {
  user_id?: string;
  user_name?: string;
  user_pass?: string;
  user_email?: string;
  user_role?: 'Admin' | 'Inst' | 'User';
  grp_id?: string;
}

export interface IfTbLogin extends TbLogin {}
