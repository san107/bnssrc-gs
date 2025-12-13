use sea_orm_migration::{prelude::*, schema::*};

use crate::m20241204_141048_tb_water::TbWater;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .create_table(
        Table::create()
          .table(TbWaterGrp::Table)
          .comment("수위계그룹")
          .if_not_exists()
          .col(integer(TbWaterGrp::WaterSeq).comment("수위계일련번호"))
          .col(integer(TbWaterGrp::LnkWaterSeq).comment("연결수위계일련번호"))
          .primary_key(Index::create().col(TbWaterGrp::WaterSeq).col(TbWaterGrp::LnkWaterSeq))
          .foreign_key(
            ForeignKey::create()
              .from(TbWaterGrp::Table, TbWaterGrp::LnkWaterSeq)
              .to(TbWater::Table, TbWater::WaterSeq)
              .on_delete(ForeignKeyAction::Cascade)
              .on_update(ForeignKeyAction::Cascade),
          )
          .foreign_key(
            ForeignKey::create()
              .from(TbWaterGrp::Table, TbWaterGrp::LnkWaterSeq)
              .to(TbWater::Table, TbWater::WaterSeq)
              .on_delete(ForeignKeyAction::Cascade)
              .on_update(ForeignKeyAction::Cascade),
          )
          .to_owned(),
      )
      .await
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager.drop_table(Table::drop().table(TbWaterGrp::Table).to_owned()).await
  }
}

#[derive(DeriveIden)]
enum TbWaterGrp {
  Table,
  WaterSeq,
  LnkWaterSeq,
}
