/*
  #[sea_orm(primary_key)]
  pub wt_seq: i32,
  pub wt_rgn_nm: String,
  #[sea_orm(column_type = "Double")]
  pub wt_lat: f64,
  #[sea_orm(column_type = "Double")]
  pub wt_lng: f64,
  pub disp_seq: Option<i32>,
  */

export class TbWeather {
  wt_seq?: number;
  wt_rgn_nm?: string;
  wt_lat?: number;
  wt_lng?: number;
  disp_seq?: number | null;
}

export interface IfTbWeather extends TbWeather {}
