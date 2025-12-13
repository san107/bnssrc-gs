use sea_orm::DbConn;

use crate::{
  eanyhow, eanyhowf,
  entities::tb_water,
  models::cd::{CommStat, WaterStat},
  svc::water::svc_water_grp,
  ws::wsmodels::GrpStat,
};

#[allow(dead_code)]
pub fn get_water_grp_id(waters: &Vec<tb_water::Model>) -> String {
  waters
    .iter()
    .map(|w| w.water_seq.to_string())
    .collect::<Vec<String>>()
    .join(",")
}

pub async fn get_water_grp_id_by_seq(db: &DbConn, seq: i32) -> anyhow::Result<String> {
  let mut seqs = svc_water_grp::qry::Qry::find_lnks_by_water_seq(&db, seq).await?;
  if seqs.len() != 1 {
    let msg = format!("water_seq {} 그룹에 속해있는 수위계가 1개가 아닙니다.", seq);
    log::error!("{}", msg);
    return Err(eanyhow!(msg));
  }
  seqs.push(seq);
  seqs.sort();

  Ok(seqs.iter().map(|s| s.to_string()).collect::<Vec<String>>().join(","))
}

pub async fn get_grp_waters(db: &DbConn, seq: i32) -> anyhow::Result<Vec<tb_water::Model>> {
  let waters = svc_water_grp::qry::Qry::find_water_by_seq_all(&db, seq).await?;
  if waters.len() != 2 {
    let msg = format!("water_seq {} 그룹에 속해있는 수위계가 2개가 아닙니다.", seq);
    log::error!("{}", msg);
    return Err(eanyhow!(msg));
  }

  Ok(waters)
}

pub fn get_grp_water_stat(m1: &tb_water::Model, m2: &tb_water::Model) -> GrpStat {
  if m1.comm_stat == Some(CommStat::Err.to_string()) || m2.comm_stat == Some(CommStat::Err.to_string()) {
    GrpStat::CommErr // 어느하나라도 오류이면 오류.
  } else if m1.water_stat == Some(WaterStat::Crit.to_string()) && m2.water_stat == Some(WaterStat::Crit.to_string()) {
    GrpStat::Crit
  } else if m1.water_stat == Some(WaterStat::Crit.to_string()) || m2.water_stat == Some(WaterStat::Crit.to_string()) {
    GrpStat::Warn
  } else {
    GrpStat::Ok
  }
}

pub fn get_grp_water_seqs(water_grp_id: &str) -> anyhow::Result<(i32, i32)> {
  let seqs = water_grp_id
    .split(",")
    .filter_map(|s| s.parse::<i32>().ok())
    .collect::<Vec<i32>>();

  if seqs.len() != 2 {
    return Err(eanyhowf!("water_grp_id 에 속해있는 수위계가 2개가 아닙니다. {water_grp_id}"));
  }

  Ok((seqs[0], seqs[1]))
}

#[allow(dead_code)]
pub fn get_grp_water_stats(list: &Vec<tb_water::Model>) -> (String, String) {
  let stats = list
    .iter()
    .map(|w| {
      (
        w.comm_stat.clone().unwrap_or_default(),
        w.water_stat.clone().unwrap_or_default(),
      )
    })
    .fold(
      (Vec::<String>::new(), Vec::<String>::new()),
      |mut acc, (comm_stat, water_stat)| {
        acc.0.push(comm_stat);
        acc.1.push(water_stat);
        acc
      },
    );

  (stats.0.join(","), stats.1.join(","))
}
