use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .create_table(
        Table::create()
          .table(TbEmcallGrpStatHist::Table)
          .comment("비상통화그룹상태이력")
          .if_not_exists()
          .col(pk_auto(TbEmcallGrpStatHist::EmcallGrpStatHistSeq).comment("비상통화그룹상태이력일련번호"))
          .col(
            string(TbEmcallGrpStatHist::EmcallGrpId)
              .string_len(30)
              .comment("비상통화그룹ID"),
          )
          .col(
            string(TbEmcallGrpStatHist::EmcallGrpStatJson)
              .string_len(1024)
              .null()
              .comment("비상통화그룹상태JSON"),
          )
          .col(date_time(TbEmcallGrpStatHist::EmcallGrpStatDt).comment("비상통화그룹상태일시"))
          .col(string(TbEmcallGrpStatHist::CommStat).string_len(30).comment("통신상태"))
          .col(
            string(TbEmcallGrpStatHist::CommStatMsg)
              .string_len(128)
              .comment("통신상태 메시지"),
          )
          .col(string(TbEmcallGrpStatHist::UserId).string_len(32).comment("사용자 아이디"))
          .to_owned(),
      )
      .await
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .drop_table(Table::drop().table(TbEmcallGrpStatHist::Table).to_owned())
      .await
  }
}

#[derive(DeriveIden)]
enum TbEmcallGrpStatHist {
  Table,
  EmcallGrpStatHistSeq,
  EmcallGrpId,
  EmcallGrpStatJson,
  EmcallGrpStatDt,
  CommStat,
  CommStatMsg,
  UserId,
}
