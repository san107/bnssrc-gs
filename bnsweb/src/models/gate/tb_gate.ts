import { WaterStat } from '@/models/water/tb_water';

export type GateType =
  | 'Hpsys'
  | 'Itson'
  | 'Autogate'
  | 'Doori'
  | 'Hngsk'
  | 'HpsysCrtn'
  | 'Fptech'
  | 'Realsys'
  | 'Sysbase'
  | 'Yesung';

export type GateStat = '' | 'UpOk' | 'UpLock' | 'DownOk' | 'Stop' | 'Na';

export type GateCmdRslt = '' | 'Success' | 'Fail' | 'ModeErr';

export type GateCmd =
  | ''
  | 'Up'
  | 'Down'
  | 'Stat'
  | 'UpAsync'
  | 'DownAsync'
  | 'Stop'
  | 'ELock'
  | 'EUnLock'
  | 'Wind'
  | 'Side'
  | 'Center';

export class TbGate {
  gate_seq?: number;
  gate_lat?: number;
  gate_lng?: number;
  gate_nm?: string;
  gate_ip?: string;
  gate_port?: number;
  gate_type?: GateType;
  down_type?: 'Auto' | 'Man';
  auto_down_cond?: WaterStat | null;
  gate_no?: number | null;
  cam_seq?: number | null;
  gate_stat?: GateStat;
  cmd_rslt?: GateCmdRslt;
  ebrd_oper_mode?: '' | 'AutoDown' | 'Down' | 'None';
  emcall_oper_mode?: '' | 'AutoDown' | 'Down' | 'None';
  grp_id?: string;
}

export interface IfTbGate extends TbGate { }

export class GateCmdReq {
  gate_seq?: number;
  gate_cmd?: GateCmd;
  msg?: string;
}

export interface IfGateCmdReq extends GateCmdReq { }

export class GateCmdRes {
  cmd_res?: GateCmdRslt;
  cmd_res_msg?: string;
  gate_status?: GateStat;
}

export interface IfGateCmdRes extends GateCmdRes { }

/* 
{"cmd_res":"Success","cmd_res_msg":"Remote:Off,Up:Off,Down:On,Doing:Off,Fault:Off,Auto:On","gate_status":"DownOk"} 
*/

export class GateCmdResHngsk extends GateCmdRes {
  remote?: '' | 'On' | 'Off';
  up?: '' | 'On' | 'Off';
  down?: '' | 'On' | 'Off';
  doing?: '' | 'On' | 'Off';
  fault?: '' | 'On' | 'Off';
  auto?: '' | 'On' | 'Off';
}

export const parseGateCmdResHngsk = (res: IfGateCmdRes): GateCmdResHngsk => {
  const { cmd_res, cmd_res_msg, gate_status } = res;
  const hngsk = cmd_res_msg?.split(',').reduce((acc, item) => {
    const [key, value] = item.split(':');
    acc[key.trim().toLowerCase()] = value.trim();
    return acc;
  }, {} as Record<string, string>);
  return {
    cmd_res,
    ...hngsk,
    gate_status,
  };
};

export class GateCmdResFptech extends GateCmdRes {
  UpDoing?: '' | 'On' | 'Off';
  UpDone?: '' | 'On' | 'Off';
  DownDoing?: '' | 'On' | 'Off';
  DownDone?: '' | 'On' | 'Off';
  CenterUpLock?: '' | 'On' | 'Off';
  CenterDownLock?: '' | 'On' | 'Off';
}

export const parseGateCmdResFptech = (res: IfGateCmdRes): GateCmdResFptech => {
  const { cmd_res, cmd_res_msg, gate_status } = res;
  const data = cmd_res_msg?.split(',').reduce((acc, item) => {
    const [key, value] = item.split(':');
    acc[key.trim()] = value.trim();
    return acc;
  }, {} as Record<string, string>);
  return {
    cmd_res,
    ...data,
    gate_status,
  };
};

export class GateCmdResHpsysCrtn extends GateCmdRes {
  Remote?: '' | 'On' | 'Off';
  CrtnUp?: '' | 'On' | 'Off';
  CrtnDoing?: '' | 'On' | 'Off';
  CrtnDown?: '' | 'On' | 'Off';
  Down?: '' | 'On' | 'Off';
  Doing?: '' | 'On' | 'Off';
  Up?: '' | 'On' | 'Off';
  Fault?: '' | 'On' | 'Off';
}

export const parseGateCmdResHpsysCrtn = (res: IfGateCmdRes): GateCmdResHpsysCrtn => {
  const { cmd_res, cmd_res_msg, gate_status } = res;
  const data = cmd_res_msg?.split(',').reduce((acc, item) => {
    const [key, value] = item.split(':');
    acc[key.trim()] = value.trim();
    return acc;
  }, {} as Record<string, string>);
  return {
    cmd_res,
    ...data,
    gate_status,
  };
};

export class GateCmdResHpsys extends GateCmdRes {
  Remote?: '' | 'On' | 'Off';
  Down?: '' | 'On' | 'Off';
  Doing?: '' | 'On' | 'Off';
  Up?: '' | 'On' | 'Off';
  Fault?: '' | 'On' | 'Off';
  Moving?: '' | 'On' | 'Off';
  Side?: '' | 'On' | 'Off';
  Center?: '' | 'On' | 'Off';
}

export const parseGateCmdResHpsys = (res: IfGateCmdRes): GateCmdResHpsys => {
  const { cmd_res, cmd_res_msg, gate_status } = res;
  const data = cmd_res_msg?.split(',').reduce((acc, item) => {
    const [key, value] = item.split(':');
    acc[key.trim()] = value.trim();
    return acc;
  }, {} as Record<string, string>);
  return {
    cmd_res,
    ...data,
    gate_status,
  };
};

export class GateCmdResItson extends GateCmdRes {
  elock_status?: '' | 'Lock' | 'UnLock' | 'Na';
}

export interface IfGateCmdResItson extends GateCmdResItson { }

// autogate

export class GateCmdResDoori extends GateCmdRes {
  auto_man?: '' | 'Auto' | 'Manunal' | 'Na';
  rem_loc?: '' | 'Local' | 'Remote' | 'Na';
  wind_mode?: '' | 'Wind' | 'Def' | 'Na';
}

export interface IfGateCmdResDoori extends GateCmdResDoori { }

export class GateCmdResYesung extends GateCmdRes {
  remote?: '' | 'On' | 'Off';
  up?: '' | 'On' | 'Off';
  down?: '' | 'On' | 'Off';
  doing?: '' | 'On' | 'Off';
  fault?: '' | 'On' | 'Off';
  auto?: '' | 'On' | 'Off';
}

export const parseGateCmdResYesung = (res: IfGateCmdRes): GateCmdResYesung => {
  const { cmd_res, cmd_res_msg, gate_status } = res;
  const yesung = cmd_res_msg?.split(',').reduce((acc, item) => {
    const [key, value] = item.split(':');
    acc[key.trim().toLowerCase()] = value.trim();
    return acc;
  }, {} as Record<string, string>);
  return {
    cmd_res,
    ...yesung,
    gate_status,
  };
};
