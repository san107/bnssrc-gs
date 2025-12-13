export class TcmFludWal {
  flcode?: string; // 침수지점코드
  cd_dist_wal?: number; // 수위측정소순번4
  nm_dist_wal?: string; // 차량제어기명칭
  gb_wal?: string; // 수집유형
  last_colct_de?: string; // 최종수집일시
  last_colct_wal?: number; // 최종수집수위m5,3
  lat?: number; // 위도10,7
  lon?: number; // 경도10,7
  rm?: string; // 비고
  use_yn?: string; // 사용여부
  rgsde?: string; // 최초등록일시
  updde?: string; // 최종수정일시
}

export interface IfTcmFludWal extends TcmFludWal {}

export const getTcmFludWalKey = (o?: IfTcmFludWal): string => {
  if (!o) return '';
  return '' + o.flcode + o.cd_dist_wal;
};

export const hasTcmFludWalKey = (o?: IfTcmFludWal): boolean => {
  if (!o) return false;
  if (o.flcode && o.cd_dist_wal) return true;
  return false;
};
