pub struct Qry;

use crate::entities as ent;
use crate::entities::prelude::*;
use crate::entities::tb_water_hist::{self};
use chrono::{DateTime, Local};
use log::debug;
use sea_orm::*;
use sea_query::{MysqlQueryBuilder, Expr};
use std::time::Duration;

impl Qry {
  #[allow(dead_code)]
  pub async fn find_by_id(db: &DbConn, id: i32) -> Result<Option<ent::tb_water_hist::Model>, DbErr> {
    TbWaterHist::find_by_id(id).one(db).await
  }

  // #[allow(dead_code)]
  // pub async fn find_all(db: &DbConn, limit: u64) -> Result<Vec<ent::tb_water_hist::Model>, DbErr> {
  //   let mut q = TbWaterHist::find().order_by(tb_water_hist::Column::WaterHistSeq, Order::Desc);
  //   sea_orm::QueryTrait::query(&mut q).offset(0).limit(limit);
  //   q.all(db).await
  // }

  #[allow(dead_code)]
  pub async fn find_all(
    db: &DbConn,
    water_dev_id: Option<String>,
    limit: Option<u64>,
    limit_hour: Option<u64>,
  ) -> Result<Vec<ent::tb_water_hist::Model>, DbErr> {
    match limit {
      Some(limit) => {
        let mut q = TbWaterHist::find().order_by(tb_water_hist::Column::WaterDt, Order::Desc);
        if let Some(water_dev_id) = water_dev_id {
          q = q.filter(tb_water_hist::Column::WaterDevId.eq(water_dev_id));
        }
        if let Some(limit_hour) = limit_hour {
          // 시간으로도 제한을 둠.(우선은, limit가 있을때만 적용)
          let limit = Local::now() - Duration::from_secs(limit_hour * 3600);
          debug!("limit_hour: {:?}", limit);
          q = q.filter(tb_water_hist::Column::WaterDt.gt(limit.naive_local())); // 타임존 없애고 비교함.( 저장할 때 이렇게 함으로 조회도 동일하게..)
        }
        sea_orm::QueryTrait::query(&mut q).offset(0).limit(limit);
        debug!("find_all q: {:?}", q.as_query().to_string(MysqlQueryBuilder)); // 쿼리 파라미터 로그 확인.
        q.all(db).await
      }
      None => {
        TbWaterHist::find()
          .order_by(tb_water_hist::Column::WaterDt, Order::Desc)
          .all(db)
          .await
      }
    }
  }

  pub async fn find_by_range(
    db: &DbConn,
    water_dev_id: Option<String>,
    start_dt: Option<DateTime<Local>>,
    end_dt: Option<DateTime<Local>>,
  ) -> Result<Vec<ent::tb_water_hist::Model>, DbErr> {
    TbWaterHist::find()
      .filter(tb_water_hist::Column::WaterDevId.eq(water_dev_id))
      // .filter(tb_water_hist::Column::WaterDt.between(start_dt, end_dt))
      .filter(tb_water_hist::Column::WaterDt.between(start_dt.unwrap().naive_local(), end_dt.unwrap().naive_local()))
      .order_by(tb_water_hist::Column::WaterDt, Order::Asc)
      .all(db)
      .await

      
  }

  pub async fn find_by_month(
    db: &DbConn,
    water_dev_id: Option<String>,
    year_month: &str,
  ) -> Result<Vec<ent::tb_water_hist::Model>, DbErr> {
    TbWaterHist::find()
      .filter(tb_water_hist::Column::WaterDevId.eq(water_dev_id))
      .filter(Expr::cust(format!("DATE_FORMAT(water_dt, '%Y-%m') = '{}'", year_month)))
      .order_by(tb_water_hist::Column::WaterDt, Order::Asc)
      .all(db)
      .await
  }

  #[allow(dead_code)]
  pub async fn find_by_list(
    db: &DbConn,
    devid: String,
    offset: u64,
    limit: Option<u64>,
  ) -> Result<Vec<ent::tb_water_hist::Model>, DbErr> {
    match limit {
      Some(limit) => {
        let mut q = TbWaterHist::find()
          .filter(tb_water_hist::Column::WaterDevId.eq(devid))
          .order_by(tb_water_hist::Column::WaterDt, Order::Desc);
        sea_orm::QueryTrait::query(&mut q).offset(offset).limit(limit);
        q.all(db).await
      }
      None => {
        TbWaterHist::find()
          .filter(tb_water_hist::Column::WaterDevId.eq(devid))
          .order_by(tb_water_hist::Column::WaterDt, Order::Desc)
          .all(db)
          .await
      }
    }
  }
}
