use std::collections::HashMap;

use lazy_static::lazy_static;
use std::sync::Arc;
use tokio::sync::Mutex;

struct Ctx {
  map: HashMap<String, Arc<Mutex<()>>>, // 중복 방지용.(stat_hander와 receiver 간의 중복 방지용)
}

lazy_static! {
  static ref CTX: Arc<Mutex<Ctx>> = Arc::from(Mutex::from(Ctx { map: HashMap::new() }));
}

pub async fn mutex(key: &str) -> Arc<Mutex<()>> {
  let mut ctx = CTX.lock().await;
  if !ctx.map.contains_key(key) {
    ctx.map.insert(key.to_string(), Arc::new(Mutex::new(())));
  }
  ctx.map.get(key).unwrap().clone()
}
