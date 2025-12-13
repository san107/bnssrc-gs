use sea_orm::*;

use crate::entities::{prelude::*, tb_weather};

pub struct Qry;

impl Qry {
  pub async fn find_by_id(db: &DbConn, id: i32) -> Result<Option<tb_weather::Model>, DbErr> {
    TbWeather::find_by_id(id).one(db).await
  }

  pub async fn find_all(db: &DbConn) -> Result<Vec<tb_weather::Model>, DbErr> {
    TbWeather::find()
      .order_by(tb_weather::Column::DispSeq, Order::Asc)
      .order_by(tb_weather::Column::WtSeq, Order::Asc)
      .all(db)
      .await
  }
}
