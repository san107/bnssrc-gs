export class TbNdmsMapGate {
  flcode?: string;
  cd_dist_intrcp?: number;
  gate_seq?: number;
}

export interface IfTbNdmsMapGate extends TbNdmsMapGate {}

export const getTbNdmsMapGateKey = (o?: TbNdmsMapGate): string => {
  if (!o) return '';
  return '' + o.flcode + o.cd_dist_intrcp;
};
