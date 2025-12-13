use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .create_table(
        Table::create()
          .table(TbEbrdHist::Table)
          .comment("전광판 이력")
          .if_not_exists()
          .col(pk_auto(TbEbrdHist::EbrdHistSeq).comment("이력 일련번호"))
          .col(integer(TbEbrdHist::EbrdSeq).comment("전광판 일련번호"))
          .col(string(TbEbrdHist::EbrdId).string_len(30).comment("전광판 아이디"))
          .col(string(TbEbrdHist::CommStat).string_len(30).comment("상태"))
          .col(date_time(TbEbrdHist::UpdateDt).comment("업데이트 일시"))
          .col(text(TbEbrdHist::Json).comment("이력 내용"))
          .col(string(TbEbrdHist::CmdRslt).string_len(30).null().comment("명령 처리 결과"))
          .col(integer(TbEbrdHist::CmdRsltCd).null().comment("명령 처리 결과 코드"))
          .to_owned(),
      )
      .await
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager.drop_table(Table::drop().table(TbEbrdHist::Table).to_owned()).await
  }
}

#[derive(DeriveIden)]
enum TbEbrdHist {
  Table,
  EbrdHistSeq,
  EbrdSeq,
  EbrdId,
  CommStat,
  CmdRslt,
  CmdRsltCd,
  UpdateDt,
  Json,
}
