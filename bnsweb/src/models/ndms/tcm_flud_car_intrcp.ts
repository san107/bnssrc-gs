export class TcmFludCarIntrcp {
  flcode?: string; // 침수지점코드
  cd_dist_intrcp?: number; // 차량제어기순번4
  nm_dist_intrcp?: string; // 차량제어기명칭
  gb_intrcp?: string; // 진출입유형
  mod_intrcp?: string; // 재난시차단기모드
  comm_sttus?: string; // 통신상태
  intrcp_sttus?: string; // 차단기상태
  lat?: number; // 위도10,7
  lon?: number; // 경도10,7
  rm?: string; // 비고
  use_yn?: string; // 사용여부
  rgsde?: string; // 최초등록일시
  updde?: string; // 최종수정일시
}

export interface IfTcmFludCarIntrcp extends TcmFludCarIntrcp {}

export const getTcmFludCarIntrcpKey = (o?: IfTcmFludCarIntrcp): string => {
  if (!o) return '';
  return '' + o.flcode + o.cd_dist_intrcp;
};

export const hasTcmFludCarIntrcpKey = (o?: IfTcmFludCarIntrcp): boolean => {
  if (!o) return false;
  if (o.flcode && o.cd_dist_intrcp) return true;
  return false;
};
