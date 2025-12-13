pub struct Qry;

use crate::entities::tb_board::{self, Entity as TbBoard};
use sea_orm::*;

impl Qry {
    pub async fn find_by_id(db: &DbConn, id: i32) -> Result<Option<tb_board::Model>, DbErr> {
      TbBoard::find_by_id(id).one(db).await
    }
    
    pub async fn find_all(db: &DbConn, bd_type: Option<&str>) -> Result<Vec<tb_board::Model>, DbErr> {
      TbBoard::find()
        .filter(tb_board::Column::BdType.eq(bd_type))
        .order_by(tb_board::Column::DispSeq, Order::Asc)
        .order_by(tb_board::Column::BdSeq, Order::Asc)
        .all(db)
        .await
    }
}