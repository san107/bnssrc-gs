export class TcmFludSpot {
  flcode?: string; // 침수지점코드
  flname?: string; // 침수지점명
  fladdr?: string; // 상세주소
  bdong_cd?: string; // 법정동코드
  lat?: number; // 위도10,7
  lon?: number; // 경도10,7
  advsry_wal?: number; // 주의보기준수위5,3
  alarm_wal?: number; // 경보기준수위5,3
  flud_wal?: number; // 침수기준수위5,3
  rm?: string; // 비고
  admcode?: string; // 관리기관코드
  use_yn?: string; // 사용여부
  rgsde?: string; // 최초등록일시
  updde?: string; // 최종수정일시
}

export interface IfTcmFludSpot extends TcmFludSpot {}
