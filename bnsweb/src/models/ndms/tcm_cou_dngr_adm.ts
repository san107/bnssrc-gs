export class TcmCouDngrAdm {
  admcode?: string; // 관리기관코드
  chpsnnm?: string; // 담당자명
  charge_dept?: string; // 담당부서
  cttpc?: string; // 연락처
  rm?: string; // 비고
  use_yn?: string; // 사용여부
  rgsde?: string; // 최초등록일시
  updde?: string; // 최종수정일시
}

export interface IfTcmCouDngrAdm extends TcmCouDngrAdm {}
