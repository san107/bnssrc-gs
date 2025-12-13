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
          .table(TbAlmWater::Table)
          .comment("알람수위계정보")
          .if_not_exists()
          .col(integer(TbAlmWater::WaterSeq).primary_key().comment("수위계일련번호"))
          .col(
            string(TbAlmWater::SmsWaterStat)
              .string_len(30)
              .null()
              .comment("SMS발송수위계상태"),
          )
          .col(date_time(TbAlmWater::SmsWaterStatDt).null().comment("SMS수위계상태일시"))
          .foreign_key(
            ForeignKey::create()
              .from(TbAlmWater::Table, TbAlmWater::WaterSeq)
              .to(TbWater::Table, TbWater::WaterSeq)
              .on_delete(ForeignKeyAction::Cascade)
              .on_update(ForeignKeyAction::Cascade),
          )
          .to_owned(),
      )
      .await
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager.drop_table(Table::drop().table(TbAlmWater::Table).to_owned()).await
  }
}

#[derive(DeriveIden)]
enum TbAlmWater {
  Table,
  WaterSeq,
  SmsWaterStat,
  SmsWaterStatDt,
}
