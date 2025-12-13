use chrono::{Local, NaiveTime};
use lazy_static::lazy_static;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;

struct Ctx {
  map: HashMap<i32, NaiveTime>,
}

lazy_static! {
  static ref CTX: Arc<Mutex<Ctx>> = Arc::from(Mutex::from(Ctx { map: HashMap::new() }));
}

/**
 * 원래, 수위계 업데이트 시간을 체크한 다음 10 이내는 무시하려고 했으나,
 * 수위계에, 데이터차단기를 설정하는 방식으로 처리하게 되면서, 시간 체크하지 않고도 정상동작함.
 */
#[allow(dead_code)]
pub async fn has_elapsed(water_seq: i32) -> bool {
  let mut ctx = CTX.lock().await;
  let now = Local::now().time();

  // 경과 시간을 밀리초 단위로 계산
  if let Some(prev_time) = ctx.map.get(&water_seq) {
    let now_naive = now;
    let prev_naive = *prev_time;
    // NaiveTime은 하루(24시간) 단위로만 비교 가능
    let elapsed = now_naive.signed_duration_since(prev_naive);
    let millis = elapsed.num_milliseconds();

    if millis > 10000 {
      // 10초 이상 경과시에는, 다시 처리 가능.
      //ctx.map.remove(&seq);
      log::info!("seq {}: 경과 시간 {} ms(10초 이상)", water_seq, millis);
      ctx.map.insert(water_seq, now);
      return true;
    }
    // 시간경과되지 않은 경우, 다시 처리 불가.
    log::info!("seq {}: 경과 시간 {} ms(10초 미만)-처리불가", water_seq, millis);
    return false;
  }

  log::info!("seq {}: 최초 등록, 경과 시간 없음", water_seq);
  ctx.map.insert(water_seq, now);
  return true;
}
