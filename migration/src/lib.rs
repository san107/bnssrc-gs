pub use sea_orm_migration::prelude::*;

// Add each migration file as a module
mod m20230423_083434_tb_grp;
pub mod m20241201_130535_tb_login;
pub mod m20241204_105750_tb_cd;
pub mod m20241204_112538_tb_book_mark;
pub mod m20241204_135847_tb_camera;
pub mod m20241204_141048_tb_water;
pub mod m20241204_142514_tb_gate;
pub mod m20241208_072807_tb_config;
pub mod m20241215_071244_tb_gate_hist;
pub mod m20241218_205903_tb_water_hist;
pub mod m20241221_101707_tcm_cou_dngr_adm;
pub mod m20241221_104312_tcm_cou_dngr_almord;
pub mod m20241221_115055_tcm_flud_spot;
pub mod m20241221_121634_tcm_flud_almord;
pub mod m20241221_123508_tcm_flud_car_intrcp;
pub mod m20241221_125315_tcm_flud_wal;
pub mod m20241221_222926_tb_alm_user;
pub mod m20241221_224731_tb_alm_sett;
pub mod m20241221_231008_tb_alm_hist;
pub mod m20241221_232010_tb_alm_sms_hist;
pub mod m20241224_062150_tb_water_gate;
pub mod m20241224_064157_tb_gate_camera;
pub mod m20241231_074134_tb_file;
pub mod m20250102_073911_tb_group;
pub mod m20250102_074234_tb_group_el;
pub mod m20250109_213211_tb_alm_water;
pub mod m20250124_075752_tb_region;
pub mod m20250221_035546_tb_msg;
mod m20250302_105830_tb_ndms_map_gate;
mod m20250302_105833_tb_ndms_map_water;
mod m20250423_085234_tb_grp_tree;
pub mod m20250503_033054_tb_sys_conf;
mod m20250511_111759_tb_emcall_grp;
mod m20250511_111851_tb_emcall;
mod m20250511_111933_tb_gate_emcall;
mod m20250511_152033_tb_file_tmp;
mod m20250512_083241_tb_emcall_evt_hist;
mod m20250512_084043_tb_emcall_grp_stat_hist;
mod m20250513_044636_tb_log;
mod m20250514_131823_tb_weather;
pub mod m20250517_055105_tb_ncd;
mod m20250517_092505_tb_ebrd_msg;
mod m20250517_104758_tb_ebrd;
mod m20250517_104956_tb_ebrd_map_msg;
mod m20250517_112418_tb_gate_ebrd;
mod m20250523_000528_tb_ebrd_hist;
mod m20250524_225649_tb_gate_emcall_grp;
mod m20250529_080119_tb_water_grp;
mod m20250609_005617_tb_board;
mod m20250702_130847_tcm_flud_board;
mod m20250702_134031_tb_ndms_map_ebrd;
mod m20250724_141346_tb_water_grp_stat;

pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
  fn migration_table_name() -> sea_orm::DynIden {
    Alias::new("_seaql_migrations").into_iden()
  }
  fn migrations() -> Vec<Box<dyn MigrationTrait>> {
    vec![
      Box::new(m20230423_083434_tb_grp::Migration),
      Box::new(m20241201_130535_tb_login::Migration),
      Box::new(m20241204_105750_tb_cd::Migration),
      Box::new(m20241204_112538_tb_book_mark::Migration),
      Box::new(m20241204_135847_tb_camera::Migration),
      Box::new(m20241204_141048_tb_water::Migration),
      Box::new(m20241204_142514_tb_gate::Migration),
      Box::new(m20241208_072807_tb_config::Migration),
      Box::new(m20241215_071244_tb_gate_hist::Migration),
      Box::new(m20241218_205903_tb_water_hist::Migration),
      Box::new(m20241221_101707_tcm_cou_dngr_adm::Migration),
      Box::new(m20241221_104312_tcm_cou_dngr_almord::Migration),
      Box::new(m20241221_115055_tcm_flud_spot::Migration),
      Box::new(m20241221_121634_tcm_flud_almord::Migration),
      Box::new(m20241221_123508_tcm_flud_car_intrcp::Migration),
      Box::new(m20241221_125315_tcm_flud_wal::Migration),
      Box::new(m20241221_222926_tb_alm_user::Migration),
      Box::new(m20241221_224731_tb_alm_sett::Migration),
      Box::new(m20241221_231008_tb_alm_hist::Migration),
      Box::new(m20241221_232010_tb_alm_sms_hist::Migration),
      Box::new(m20241224_062150_tb_water_gate::Migration),
      Box::new(m20241224_064157_tb_gate_camera::Migration),
      Box::new(m20241231_074134_tb_file::Migration),
      Box::new(m20250102_073911_tb_group::Migration),
      Box::new(m20250102_074234_tb_group_el::Migration),
      Box::new(m20250109_213211_tb_alm_water::Migration),
      Box::new(m20250124_075752_tb_region::Migration),
      Box::new(m20250221_035546_tb_msg::Migration),
      Box::new(m20250302_105830_tb_ndms_map_gate::Migration),
      Box::new(m20250302_105833_tb_ndms_map_water::Migration),
      Box::new(m20250423_085234_tb_grp_tree::Migration),
      Box::new(m20250503_033054_tb_sys_conf::Migration),
      Box::new(m20250511_111759_tb_emcall_grp::Migration),
      Box::new(m20250511_111851_tb_emcall::Migration),
      Box::new(m20250511_111933_tb_gate_emcall::Migration),
      Box::new(m20250511_152033_tb_file_tmp::Migration),
      Box::new(m20250512_083241_tb_emcall_evt_hist::Migration),
      Box::new(m20250512_084043_tb_emcall_grp_stat_hist::Migration),
      Box::new(m20250513_044636_tb_log::Migration),
      Box::new(m20250514_131823_tb_weather::Migration),
      Box::new(m20250517_055105_tb_ncd::Migration),
      Box::new(m20250517_092505_tb_ebrd_msg::Migration),
      Box::new(m20250517_104758_tb_ebrd::Migration),
      Box::new(m20250517_104956_tb_ebrd_map_msg::Migration),
      Box::new(m20250517_112418_tb_gate_ebrd::Migration),
      Box::new(m20250523_000528_tb_ebrd_hist::Migration),
      Box::new(m20250524_225649_tb_gate_emcall_grp::Migration),
      Box::new(m20250529_080119_tb_water_grp::Migration),
      Box::new(m20250609_005617_tb_board::Migration),
      Box::new(m20250702_130847_tcm_flud_board::Migration),
      Box::new(m20250702_134031_tb_ndms_map_ebrd::Migration),
      Box::new(m20250724_141346_tb_water_grp_stat::Migration),
    ]
  }
}
