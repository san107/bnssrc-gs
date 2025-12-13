use crate::entities::tb_emcall_grp;
use model::ItgStat;

pub mod app;
pub mod app_evt;
pub mod app_stat;
pub mod emcall_util;
pub mod evt;
pub mod model;
pub mod stat;

pub const REQWEST_TIMEOUT: u64 = 3;

pub fn get_emcall_grp_stat_url(model: &tb_emcall_grp::Model) -> String {
  format!(
    "http://{}:{}/api/ldms/status?device_id={}",
    model.emcall_grp_ip, model.emcall_grp_port, model.emcall_grp_id
  )
}

pub fn get_emcall_grp_send_url(model: &tb_emcall_grp::Model) -> String {
  format!("http://{}:{}/api/ldms/event", model.emcall_grp_ip, model.emcall_grp_port)
}

pub async fn get_emcall_grp_stat(url: String) -> Result<ItgStat, String> {
  log::info!("emcall grp stat url: {}", url);
  let client = reqwest::Client::builder()
    .timeout(std::time::Duration::from_secs(REQWEST_TIMEOUT))
    .build()
    .unwrap();
  let resp = client.get(url).send().await;
  if let Err(e) = resp {
    let err_msg = format!("emcall grp stat error: {}", e);
    log::error!("{}", err_msg);
    return Err(err_msg);
  }

  let resp = resp.unwrap();
  let body = resp.json::<ItgStat>().await;
  if let Err(e) = body {
    let err_msg = format!("emcall grp stat error: {}", e);
    log::error!("{}", err_msg);
    return Err(err_msg);
  }
  let body = body.unwrap();
  log::info!("emcall grp stat: {:?}", body);
  // 정상케이스.
  Ok(body)
}

pub async fn send_emcall_grp_stat(url: String, stat: ItgStat) -> Result<(), String> {
  log::info!("emcall grp stat url: {} {stat:?}", url);
  let client = reqwest::Client::builder()
    .timeout(std::time::Duration::from_secs(REQWEST_TIMEOUT))
    .build()
    .unwrap();

  let resp = client.post(url).json(&stat).send().await;
  if let Err(e) = resp {
    let err_msg = format!("emcall grp stat error: {}", e);
    log::error!("{}", err_msg);
    return Err(err_msg);
  }

  let resp = resp.unwrap();
  if !resp.status().is_success() {
    let err_msg = format!("emcall grp stat error: HTTP status {}", resp.status());
    log::error!("{}", err_msg);
    return Err(err_msg);
  }
  let body = resp.text().await;
  if let Err(e) = body {
    let err_msg = format!("emcall grp stat error: {}", e);
    log::info!("get text error but response is success{}", err_msg);
    return Ok(());
  }
  let body = body.unwrap();
  log::info!("emcall grp send stat res is : {}", body);
  // 정상케이스.
  Ok(())
}
