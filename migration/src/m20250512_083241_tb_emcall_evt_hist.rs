use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .create_table(
        Table::create()
          .table(TbEmcallEvtHist::Table)
          .comment("비상통화장치 이벤트 이력")
          .if_not_exists()
          .col(pk_auto(TbEmcallEvtHist::EmcallEvtHistSeq).comment("비상통화장치 이벤트 이력 일련번호"))
          .col(string(TbEmcallEvtHist::EmcallId).string_len(30).comment("비상통화장치 ID"))
          .col(string(TbEmcallEvtHist::CommStat).string_len(30).comment("통신상태"))
          .col(
            string(TbEmcallEvtHist::EmcallEvtType)
              .string_len(30)
              .comment("비상통화장치 이벤트 타입"),
          )
          .col(date_time(TbEmcallEvtHist::EmcallEvtDt).comment("비상통화장치 이벤트 발생 일시"))
          .to_owned(),
      )
      .await
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .drop_table(Table::drop().table(TbEmcallEvtHist::Table).to_owned())
      .await
  }
}

#[derive(DeriveIden)]
enum TbEmcallEvtHist {
  Table,
  EmcallEvtHistSeq,
  EmcallId,
  CommStat,
  EmcallEvtType,
  EmcallEvtDt,
}
