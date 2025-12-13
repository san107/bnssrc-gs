use lazy_static::lazy_static;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;

struct Ctx {
  map: HashMap<String, Arc<Mutex<()>>>,
}

lazy_static! {
  static ref CTX: Arc<Mutex<Ctx>> = Arc::from(Mutex::from(Ctx { map: HashMap::new() }));
}

/**
 * 각 그룹을 처리할 때는, lock 을 획득한다음, grp_stat 테이블을 조작한다. 그래야,
 * 중복처리되지 않는다.
 */
#[allow(dead_code)]
pub async fn get_water_grp_lock(water_grp_id: &str) -> Arc<Mutex<()>> {
  let mut ctx = CTX.lock().await;

  let lock = ctx.map.get(water_grp_id);
  if let Some(lock) = lock {
    return lock.clone();
  }

  let lock = Arc::new(Mutex::new(()));
  ctx.map.insert(water_grp_id.to_string(), lock.clone());
  lock
}
