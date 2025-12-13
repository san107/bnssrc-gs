use super::*;
use actix_web::web;

pub fn register(config: &mut web::ServiceConfig) {
  auth::regist(config);
  login::regist(config);
  alm_user::regist(config);
  alm_sett::regist(config);
  camera::regist_route(config);
  book_mark::regist_route(config);
  gate::regist_route(config);
  gate_camera::regist(config);
  gate_hist::regist(config);
  grp::regist_route(config);
  grp_tree::regist_route(config);
  water_hist::regist(config);
  group::regist_route(config);
  water::regist_route(config);
  water_gate::regist_route(config);
  water_grp::regist_route(config);
  water_grp_stat::regist_route(config);
  cd::regist_route(config);
  group_el::regist(config);
  msg::regist(config);
  region::regist(config);
  board::regist_route(config);

  // ndms
  ndms::cou_dngr_adm::regist_route(config);
  ndms::cou_dngr_almord::regist_route(config);
  ndms::flud_almord::regist_route(config);
  ndms::flud_car_intrcp::regist_route(config);
  ndms::flud_spot::regist_route(config);
  ndms::flud_wal::regist_route(config);
  ndms::flud_board::regist_route(config);
  ndms::ndms_map_gate::regist_route(config);
  ndms::ndms_map_water::regist_route(config);
  ndms::ndms_map_ebrd::regist_route(config);

  file::regist(config);
  sys_conf::regist_route(config);
  ebrd::regist_route(config);
  ebrd_map_msg::regist_route(config);
  ebrd_msg::regist_route(config);
  emcall::regist_route(config);
  emcall_evt_hist::regist_route(config);
  emcall_grp::regist_route(config);
  gate_ebrd::regist(config);
  gate_emcall::regist(config);
  gate_emcall_grp::regist(config);
  public::regist(config);
  weather::regist(config);
  ncd::regist(config);
  config::regist_route(config);
  req::regist_route(config);
  sms::regist_route(config);
  tests::regist_route(config); // 테스트를 맨마지막으로
}
