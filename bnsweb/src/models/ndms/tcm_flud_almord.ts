export class TcmFludAlmord {
  flcode?: string; // 침수지점코드
  cd_dist_intrcp?: number; // 차량제어기순번4
  sttusde?: string; // 상태변경일시
  intrcp_sttus?: string; // 차단기상태
  rm?: string; // 비고
  admcode?: string; // 관리기관코드
  rgsde?: string; // 최초등록일시
  updde?: string; // 최종수정일시
}

export interface IfTcmFludAlmord extends TcmFludAlmord {}

export const getTcmFludAlmordKey = (o?: TcmFludAlmord): string => {
  if (!o) return '';
  return '' + o.flcode + o.cd_dist_intrcp + o.sttusde + o.intrcp_sttus;
};
