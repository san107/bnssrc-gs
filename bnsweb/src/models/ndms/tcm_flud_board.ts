/*
pub struct Model {
  #[sea_orm(column_name = "FLCODE", primary_key, auto_increment = false)]
  pub flcode: String,
  #[sea_orm(column_name = "CD_DIST_BOARD", primary_key, auto_increment = false)]
  pub cd_dist_board: i32,
  #[sea_orm(column_name = "NM_DIST_BOARD")]
  pub nm_dist_board: String,
  #[sea_orm(column_name = "COMM_STTUS")]
  pub comm_sttus: Option<String>,
  #[sea_orm(column_name = "MSG_BOARD")]
  pub msg_board: Option<String>,
  #[sea_orm(column_name = "LAT", column_type = "Double", nullable)]
  pub lat: Option<f64>,
  #[sea_orm(column_name = "LON", column_type = "Double", nullable)]
  pub lon: Option<f64>,
  #[sea_orm(column_name = "RM")]
  pub rm: Option<String>,
  #[sea_orm(column_name = "USE_YN")]
  pub use_yn: String,
  #[sea_orm(column_name = "RGSDE")]
  pub rgsde: DateTime,
  #[sea_orm(column_name = "UPDDE")]
  pub updde: DateTime,
}
  */

export class TcmFludBoard {
  flcode?: string; // 침수지점코드
  cd_dist_board?: number; // 전광판순번
  nm_dist_board?: string; // 전광판명칭
  comm_sttus?: string; // 통신상태
  msg_board?: string; // 메시지
  lat?: number; // 위도10,7
  lon?: number; // 경도10,7
  rm?: string; // 비고
  use_yn?: string; // 사용여부
  rgsde?: string; // 최초등록일시
  updde?: string; // 최종수정일시
}

export interface IfTcmFludBoard extends TcmFludBoard {}

export const getTcmFludBoardKey = (o?: IfTcmFludBoard): string => {
  if (!o) return '';
  return '' + o.flcode + o.cd_dist_board;
};

export const hasTcmFludBoardKey = (o?: IfTcmFludBoard): boolean => {
  if (!o) return false;
  if (o.flcode && o.cd_dist_board) return true;
  return false;
};
