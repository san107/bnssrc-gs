use crate::eanyhow;
use crate::svc::water::svc_water_grp_stat;
use crate::water::recv_worker::{grp_util, water_grp_lock};
use crate::ws::wssender;
use sea_orm::*;

async fn _handle_grp_stat(db: &DbConn, water_seq: i32) -> anyhow::Result<()> {
  let water_grp_id = grp_util::get_water_grp_id_by_seq(&db, water_seq).await?;

  // lock
  let lock = water_grp_lock::get_water_grp_lock(&water_grp_id).await;
  let _lock = lock.lock().await;

  // 1. 수위계목록 조회할 것.
  // 2. 수위계그룹상태 가져올 것.
  // 3. 수위계 목록으로, 수위계 그룹상태 만들 것.
  // 4. 비교해서 필요시 이벤트 발생시킴.

  let waters = grp_util::get_grp_waters(&db, water_seq).await?;
  if waters.len() != 2 {
    return Err(eanyhow!("water grp is not 2 element"));
  }

  let grp_stat = grp_util::get_grp_water_stat(&waters[0], &waters[1]);
  let water_grp_stat = svc_water_grp_stat::qry::Qry::find_by_id(&db, &water_grp_id).await?;

  if water_grp_stat.is_none() {
    //return Err(anyhow::anyhow!("water_grp_stat not found"));
    log::debug!("신규 생성");
    svc_water_grp_stat::mtn::Mtn::update_stat(&db, &water_grp_id, grp_stat).await?;
    return Ok(());
  }

  let stat = water_grp_stat.unwrap();

  if stat.grp_stat == grp_stat.to_string() {
    log::debug!("상태 변경 없음");
    return Ok(());
  }

  svc_water_grp_stat::mtn::Mtn::update_stat(&db, &water_grp_id, grp_stat).await?;
  wssender::send_ws_water_grp_stat(water_grp_id, grp_stat).await; // 상태 알람 전송.

  // if stat.comm_stats == comm_stats && stat.water_stats == water_stats {
  //   log::debug!("상태 변경 없음");
  //   return Ok(());
  // }

  // 상태 변경 있음.
  // 상태 처리 조건.
  // 1. 통신 오류가 하나라도 있으면, 통신오류팝업.
  // 2. 수위계하나라도 Crit 이면, 경고 팝업.
  // 3. 수위계모두 Crit 이면 닫기여부 팝업.

  // 상태 업데이트 먼저 처리함.
  //svc_water_grp_stat::mtn::Mtn::update_stat(&db, &water_grp_id, &comm_stats, &water_stats).await?;

  // Action 처리 방법.
  // 상태 변경시에 Action을 초기화 시킨다.
  // 각, 상황에 맞춰서 Action을 취했으면 두번 액션을 취하도록 하지 않는다. ( 즉, 중복 처리 방지를 위한 값임. )
  // Action의 종류는, Crit 이다.
  // 누군가가, 취소를 누르거나, 닫기 명령을 처리하면, Action Done으로 처리한다.
  // Done 인경우, 동일한 작업을 다시 수행하지 않는다.
  // 처리 명령의 종류는, 하강/중지/화면닫기 가 있다.

  // let _ = svc_water_grp_stat::mtn::Mtn::update_comm_stat(&db, &water_grp_id, &comm_stats, &water_stats).await?;

  Ok(())
}

pub async fn handle_grp_stat(db: DbConn, water_seq: i32) -> anyhow::Result<()> {
  let rslt = _handle_grp_stat(&db, water_seq).await;
  if let Err(e) = rslt {
    log::error!("handle_istec_event error {:?} {water_seq}", e);
    return Err(e);
  }

  Ok(())
}
