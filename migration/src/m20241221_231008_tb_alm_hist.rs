use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .create_table(
        Table::create()
          .table(TbAlmHist::Table)
          .comment("알람이력")
          .if_not_exists()
          .col(pk_auto(TbAlmHist::AlmHistSeq).comment("알람이력일련번호"))
          .col(integer(TbAlmHist::WaterSeq).comment("수위계일련번호"))
          .col(string(TbAlmHist::AlmCd).string_len(30).comment("알람코드-NDMS연계"))
          .col(date_time(TbAlmHist::AlmDt).comment("알람일시"))
          .col(double(TbAlmHist::AlmWaterLevl).comment("알람수위값"))
          .to_owned(),
      )
      .await
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager.drop_table(Table::drop().table(TbAlmHist::Table).to_owned()).await
  }
}

#[derive(DeriveIden)]
enum TbAlmHist {
  Table,
  AlmHistSeq,
  WaterSeq,
  AlmCd,
  AlmDt,
  AlmWaterLevl,
}
