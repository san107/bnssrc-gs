use std::fmt::Debug;

use chrono::NaiveDateTime;
use downcast_rs::{impl_downcast, DowncastSync};

#[allow(dead_code)]
pub trait NdmsBase: DowncastSync + Debug {}
impl_downcast!(NdmsBase);

#[derive(Debug, Clone)]
pub struct NdmsGate {
  pub gate_seq: i32,
  pub comm_sttus: Option<String>,
  pub intrcp_sttus: Option<String>,
}
// - mod_intrcp : 재난시 차단기 모드 : 1 UpLock, 2 DownLock, 3 Auto
// - comm_sttus : 통신상태 : 1 정상, 0 장애
// - intrcp_sttus : 차단기 상태 : 0 장애, 1 UpLock, 2 DownLock, 3 Auto, 4 LongUp
#[allow(dead_code)]
pub enum NdmsGateCommSttus {
  Normal,
  Error,
}

#[allow(dead_code)]
pub enum NdmsGateIntrcpSttus {
  Error,
  UpLock,
  DownLock,
  Auto,
  LongUp,
}

impl NdmsBase for NdmsGate {}

#[derive(Debug, Clone)]
pub struct NdmsWater {
  pub water_dev_id: String,
  pub water_dt: NaiveDateTime,
  pub water_level: f64,
}

impl NdmsBase for NdmsWater {}

#[derive(Debug, Clone)]
pub struct NdmsEbrd {
  pub ebrd_seq: i32,
  pub comm_stat: Option<String>, // 변경이 필요한 경우 설정.
  pub msg_board: Option<String>, // 변경이 필요한 경우 설정.(이벤트 발생시, 이벤트 해지시, 분단위 표출내용)
}

impl NdmsBase for NdmsEbrd {}

/*

- tcm_cou_dngr_adm : 센싱정보 관리기관 정보
  - P admcode : 관리기관코드 : 법정동코드(시군구5자리)
  - chpsnnm : 담당자명
  - charge_dept : 담당부서
  - cttpc : 연락처
  - rm : 비고
  - use_yn : 사용여부
  - rgsde : 등록일시
  - updde : 수정일시
- tcm_cou_dngr_almord : 위험경보발령정보
  - P dscode : 재해위험지구코드/시설물코드 : 법정동코드(시군구5자리) + 구분코드(1자리)+ 일련번호(4자리)
    - 구분코드 : 0-하천,1-내수,2-해일,3-저수지,4-급경사지,5-교량,6-옹벽,7-건축물,Z-기타
  - P cd_dist_obsv : 계측기 순번 : 계측기 순번이 없는 경우 0으로 전송
  - P almcode : 경보코드 : 01 관심, 02 주의/주의보, 03 경계/경보, 04 심각
  - P almde : 경보발령일시 : 년월일시분초
  - P almgb : 발령구분 : 1 발령
  - almnote : 경보발령내용
  - admcode : 관리기관코드 : 법정동코드(시군구5자리)
  - rgsde : 등록일시
  - updde : 수정일시
- tcm_flud_spot : 침수지점정보 테이블.
  - P flcode : 침수지점코드 : 법정동코드(시군구5자리)+구분코드(1자리)+일련번호(4자리)
    - 구분코드 : A 주차장, B 침수위험 지하차도, C 하천구역, D 침수우려취약도록, E 풍수해 취약지역
    - 침수지점 코드 채번 시 타 시스템과 중복되어 충돌하지 않도록 채번 필요함.
  - flname : 침수지점명
  - fladdr : 상세주소 : ..도..시(군)..면..리
  - bdong_cd : 법정동코드(10자리)
  - lat : 위도 : 위힘지역 중심점 37.1010100
  - lon : 경도 : 위험지역 중심점 128.1010100
  - advsryy_wal : 주의보기준수위 limit_warn
  - alarm_wal : 경보기준수위 limit_alert
  - flud_wal : 침수기준수위 limit_crit
  - rm : 비고
  - admcode : 관리기관 코드 : 법정동코드(시군구5자리)
  - use_yn : 사용여부 사용(Y), 미사용 또는 삭제(N)
  - rgsde : 등록일시
  - updde : 수정일시
- tcm_flud_almord : 침수경보 발령정보
  - P flcode : 침수지점코드 : 법정동코드(시군구5자리)+구분코드(1자리)+일련번호(4자리)
    - 구분코드 : A 주차장, B 침수위험 지하차도, C 하천구역, D 침수우려취약도록, E 풍수해 취약지역
  - P cd_dist_intrcp : 차량제어기 순번 : 차량제어기 순번은 순차적으로 1번부터 시작 순번이 없는 경우 0으로 전송
  - P sttusde : 상태변경일시 : 년월일시분초
  - P intrcp_sttus : 차단기 상태 : 0 장애, 1 UpLock, 2 DownLock, 3 Auto, 4 LongUp
  - rm :비고
  - admcode : 관리기관 코드 : 법정동코드(시군구5자리)
  - rgsde : 등록일시
  - updde : 수정일시
- tcm_flud_car_intrcp : 차량제어기 정보
  - P flcode : 침수지점코드 : 법정동코드(시군구5자리)+구분코드(1자리)+일련번호(4자리)
    - 구분코드 : A 주차장, B 침수위험 지하차도, C 하천구역, D 침수우려취약도록, E 풍수해 취약지역
  - P cd_dist_intrcp : 차량제어기 순번 : 차량제어기 순번은 순차적으로 1번부터 시작
  - nm_dist_intrcp : 차량제어기 명칭
  - gb_intrcp : 진출입 유형 : 1 진입, 2 진출, 3 진출입
  - mod_intrcp : 재난시 차단기 모드 : 1 UpLock, 2 DownLock, 3 Auto
  - comm_sttus : 통신상태 : 1 정상, 0 장애
  - intrcp_sttus : 차단기 상태 : 0 장애, 1 UpLock, 2 DownLock, 3 Auto, 4 LongUp
  - lat : 위도
  - lon : 경도
  - rm : 비고
  - use_yn : 사용여부 사용(Y), 미사용 또는 삭제(N)
  - rgsde : 등록일시
  - updde : 수정일시
- tcm_flud_board : 전광판정보 - 사용하지 않음.
  - P flcode : 침수지점코드
  - P cd_dist_board : 전광판 순번
  - nm_dist_board : 전광판 명칭.
  - comm_sttus : 통신상태
  - msg_board : 표출 메시지
  - lat : 위도
  - lon : 경도
  - rm : 비고
  - use_yn : 사용여부 사용(Y), 미사용 또는 삭제(N)
  - rgsde : 등록일시
  - updde : 수정일시
- tcm_flud_wal : 수위측정소 정보
  - P flcode : 침수지점코드 : 법정동코드(시군구5자리)+구분코드(1자리)+일련번호(4자리)
    - 구분코드 : A 주차장, B 침수위험 지하차도, C 하천구역, D 침수우려취약도록, E 풍수해 취약지역
  - P cd_dist_wal : 수위측정소 순번 : 수위측정소 순번은 순차적으로 1번부터 시작.
  - nm_dist_wal : 수위측정소 명칭
  - gb_wal : 수집유형 : 1 홍수통제소 , 2 자체수집
  - last_colct_de : 최종수집일시
  - last_colct_wal : 최종수집수위
  - lat : 위도
  - lon : 경도
  - rm : 비고
  - use_yn : 사용여부 사용(Y), 미사용 또는 삭제(N)
  - rgsde : 등록일시
  - updde : 수정일시


*/
