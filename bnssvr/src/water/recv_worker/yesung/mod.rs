use sea_orm::*;

use crate::{entities::tb_water, svc::water::svc_water, water::recv_worker::water_util};

// 3cm 수위계 처리
async fn do_yesung_water_3cm(db: &DbConn, model: &tb_water::Model, onoff: bool) -> anyhow::Result<()> {
  log::info!(
    "do_yesung_water_3cm water_seq {} dev_id {} onoff {}",
    model.water_seq,
    model.water_dev_id,
    onoff
  );

  water_util::do_water_onoff1(&db, &model.water_dev_id, onoff).await?;

  Ok(())
}

// 5cm 수위계 처리
async fn do_yesung_water_5cm(db: &DbConn, model: &tb_water::Model, onoff: bool) -> anyhow::Result<()> {
  log::info!(
    "do_yesung_water_5cm water_seq {} dev_id {} onoff {}",
    model.water_seq,
    model.water_dev_id,
    onoff
  );

  water_util::do_water_onoff1(&db, &model.water_dev_id, onoff).await?;

  Ok(())
}

// 아날로그 수위계 처리
async fn do_yesung_water_analog(db: &DbConn, model: &tb_water::Model, level: f64) -> anyhow::Result<()> {
  log::info!(
    "do_yesung_water_analog water_seq {} dev_id {} level {}",
    model.water_seq,
    model.water_dev_id,
    level
  );

  water_util::do_water_level(&db, &model.water_dev_id, level).await?;

  Ok(())
}

async fn _handle_yesung_onoff(db: &DbConn, gate_seq: i32, onoff_3cm: bool, onoff_5cm: bool) -> anyhow::Result<()> {
  log::info!(
    "[예성-접점] 🔍 gate_seq={} 3cm={} 5cm={} 처리 시작",
    gate_seq,
    onoff_3cm,
    onoff_5cm
  );
  
  // 3cm 수위계 찾기
  let waters_3cm = svc_water::qry::Qry::find_by_water_gate_seq(&db, "YesungWg3cm", gate_seq).await?;
  log::info!("[예성-접점] 📊 3cm 수위계 검색 결과: {}개", waters_3cm.len());
  
  if waters_3cm.is_empty() {
    log::warn!(
      "[예성-접점] ⚠️ gate_seq={}에 연결된 YesungWg3cm 타입 수위계가 없습니다!",
      gate_seq
    );
  }
  
  for water in waters_3cm {
    log::info!(
      "[예성-접점] 💧 3cm 수위계 처리: seq={} id={} name={}",
      water.water_seq, water.water_dev_id, water.water_nm
    );
    let rslt = do_yesung_water_3cm(&db, &water, onoff_3cm).await;
    if let Err(e) = rslt {
      log::error!("[예성-접점] ❌ 3cm 수위계 처리 실패: {:?} {water:?}", e);
    } else {
      log::info!("[예성-접점] ✅ 3cm 수위계 처리 완료");
    }
  }

  // 5cm 수위계 찾기
  let waters_5cm = svc_water::qry::Qry::find_by_water_gate_seq(&db, "YesungWg5cm", gate_seq).await?;
  log::info!("[예성-접점] 📊 5cm 수위계 검색 결과: {}개", waters_5cm.len());
  
  if waters_5cm.is_empty() {
    log::warn!(
      "[예성-접점] ⚠️ gate_seq={}에 연결된 YesungWg5cm 타입 수위계가 없습니다!",
      gate_seq
    );
  }
  
  for water in waters_5cm {
    log::info!(
      "[예성-접점] 💧 5cm 수위계 처리: seq={} id={} name={}",
      water.water_seq, water.water_dev_id, water.water_nm
    );
    let rslt = do_yesung_water_5cm(&db, &water, onoff_5cm).await;
    if let Err(e) = rslt {
      log::error!("[예성-접점] ❌ 5cm 수위계 처리 실패: {:?} {water:?}", e);
    } else {
      log::info!("[예성-접점] ✅ 5cm 수위계 처리 완료");
    }
  }

  log::info!("[예성-접점] ✅ gate_seq={} 접점식 처리 완료", gate_seq);
  Ok(())
}

async fn _handle_yesung_analog(db: &DbConn, gate_seq: i32, level: f64) -> anyhow::Result<()> {
  log::info!("[예성-아날로그] 🔍 gate_seq={} level={}m 처리 시작", gate_seq, level);
  
  // 아날로그 수위계 찾기
  let waters = svc_water::qry::Qry::find_by_water_gate_seq(&db, "YesungWgAnalog", gate_seq).await?;
  log::info!("[예성-아날로그] 📊 아날로그 수위계 검색 결과: {}개", waters.len());
  
  if waters.is_empty() {
    log::warn!(
      "[예성-아날로그] ⚠️ gate_seq={}에 연결된 YesungWgAnalog 타입 수위계가 없습니다!",
      gate_seq
    );
  }
  
  for water in waters {
    log::info!(
      "[예성-아날로그] 💧 아날로그 수위계 처리: seq={} id={} name={}",
      water.water_seq, water.water_dev_id, water.water_nm
    );
    let rslt = do_yesung_water_analog(&db, &water, level).await;
    if let Err(e) = rslt {
      log::error!("[예성-아날로그] ❌ 아날로그 수위계 처리 실패: {:?} {water:?}", e);
    } else {
      log::info!("[예성-아날로그] ✅ 아날로그 수위계 처리 완료");
    }
  }

  log::info!("[예성-아날로그] ✅ gate_seq={} 아날로그 처리 완료", gate_seq);
  Ok(())
}

pub async fn handle_yesung_onoff(db: DbConn, gate_seq: i32, onoff_3cm: bool, onoff_5cm: bool) -> anyhow::Result<()> {
  let rslt = _handle_yesung_onoff(&db, gate_seq, onoff_3cm, onoff_5cm).await;
  if let Err(e) = rslt {
    log::error!("handle_yesung_onoff error {:?} gate_seq={}", e, gate_seq);
    return Err(e);
  }
  Ok(())
}

pub async fn handle_yesung_analog(db: DbConn, gate_seq: i32, level: f64) -> anyhow::Result<()> {
  let rslt = _handle_yesung_analog(&db, gate_seq, level).await;
  if let Err(e) = rslt {
    log::error!("handle_yesung_analog error {:?} gate_seq={} level={}", e, gate_seq, level);
    return Err(e);
  }
  Ok(())
}