export class TcmCouDngrAlmord {
  dscode?: string; // 재해위험지구코드/시설물코드
  cd_dist_obsv?: number; // 계측기 순번4
  almcode?: string; // 경보코드
  almde?: string; // 경보발령일시
  almgb?: string; // 발령구분
  almnote?: string; // 경보발령내용
  admcode?: string; // 관리기관코드
  rgsde?: string; // 최초등록일시
  updde?: string; // 최종수정일시
}

export interface IfTcmCouDngrAlmord extends TcmCouDngrAlmord {}

export const getTcmCouDngrAlmordKey = (o?: IfTcmCouDngrAlmord): string => {
  if (!o) return '';
  return '' + o.dscode + o.cd_dist_obsv + o.almcode + o.almde + o.almgb;
};

export const hasTcmCouDngrAlmordKey = (o?: IfTcmCouDngrAlmord): boolean => {
  if (!o) return false;
  if (o.dscode && o.cd_dist_obsv && o.almcode && o.almde && o.almgb) return true;
  return false;
};
