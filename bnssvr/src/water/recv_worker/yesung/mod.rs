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
    "handle yesung water onoff gate_seq {} 3cm={} 5cm={}",
    gate_seq,
    onoff_3cm,
    onoff_5cm
  );
  
  // 3cm 수위계 찾기
  let waters_3cm = svc_water::qry::Qry::find_by_water_gate_seq(&db, "YesungWg3cm", gate_seq).await?;
  for water in waters_3cm {
    let rslt = do_yesung_water_3cm(&db, &water, onoff_3cm).await;
    if let Err(e) = rslt {
      log::error!("do_yesung_water_3cm error {:?} {water:?}", e);
    }
  }

  // 5cm 수위계 찾기
  let waters_5cm = svc_water::qry::Qry::find_by_water_gate_seq(&db, "YesungWg5cm", gate_seq).await?;
  for water in waters_5cm {
    let rslt = do_yesung_water_5cm(&db, &water, onoff_5cm).await;
    if let Err(e) = rslt {
      log::error!("do_yesung_water_5cm error {:?} {water:?}", e);
    }
  }

  Ok(())
}

async fn _handle_yesung_analog(db: &DbConn, gate_seq: i32, level: f64) -> anyhow::Result<()> {
  log::info!("handle yesung water analog gate_seq {} level {}", gate_seq, level);
  
  // 아날로그 수위계 찾기
  let waters = svc_water::qry::Qry::find_by_water_gate_seq(&db, "YesungWgAnalog", gate_seq).await?;
  
  for water in waters {
    let rslt = do_yesung_water_analog(&db, &water, level).await;
    if let Err(e) = rslt {
      log::error!("do_yesung_water_analog error {:?} {water:?}", e);
    }
  }

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