use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .create_table(
        Table::create()
          .table(TbWaterGrpStat::Table)
          .comment("수위계그룹상태테이블")
          .if_not_exists()
          .col(
            string_len(TbWaterGrpStat::WaterGrpId, 64)
              .primary_key()
              .comment("수위계그룹ID:seq,seq"),
          )
          .col(string_len(TbWaterGrpStat::GrpStat, 64).comment("상태:Ok,CommErr,Warn,Crit"))
          .col(string_len(TbWaterGrpStat::Action, 30).comment("동작 : Done"))
          .to_owned(),
      )
      .await
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .drop_table(Table::drop().table(TbWaterGrpStat::Table).to_owned())
      .await
  }
}

#[derive(DeriveIden)]
enum TbWaterGrpStat {
  Table,
  WaterGrpId,
  GrpStat,
  Action,
}
