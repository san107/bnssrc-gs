use crate::{entities::tb_water, models::cd::WaterStat};
use std::env;

#[macro_use]
pub mod macros;

pub async fn sleep(ms: u64) {
  tokio::time::sleep(tokio::time::Duration::from_millis(ms)).await
}

pub fn get_water_stat(model: tb_water::Model, water_level: f64) -> String {
  if water_level < model.limit_attn {
    WaterStat::Norm.to_string()
  } else if water_level < model.limit_warn {
    WaterStat::Attn.to_string()
  } else if water_level < model.limit_alert {
    WaterStat::Warn.to_string()
  } else if water_level < model.limit_crit {
    WaterStat::Alert.to_string()
  } else {
    WaterStat::Crit.to_string()
  }
}

pub fn get_env_bool(key: &str, def: bool) -> bool {
  env::var(key).unwrap_or("".to_owned()).parse::<bool>().unwrap_or(def)
}

pub fn get_env_i32(key: &str, def: i32) -> i32 {
  env::var(key).unwrap_or("".to_owned()).parse::<i32>().unwrap_or(def)
}

pub fn get_env_u64(key: &str, def: u64) -> u64 {
  env::var(key).unwrap_or("".to_owned()).parse::<u64>().unwrap_or(def)
}

pub fn get_env_str(key: &str, def: &str) -> String {
  env::var(key).unwrap_or(def.to_owned())
}

#[allow(dead_code)]
pub fn err_file_name(file: &str) -> String {
  let path = file.split(std::path::MAIN_SEPARATOR).collect::<Vec<&str>>();
  if path.len() > 2 {
    return path[2..].join("/").to_string();
  }
  path.join("/").to_string()
}
