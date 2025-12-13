use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .create_table(
        Table::create()
          .table(TbAlmSmsHist::Table)
          .comment("알람SMS이력")
          .if_not_exists()
          .col(pk_auto(TbAlmSmsHist::AlmSmsHistSeq).comment("알람SMS이력일련번호"))
          .col(string(TbAlmSmsHist::SmsMsg).string_len(512).comment("SMS메시지"))
          .col(date_time(TbAlmSmsHist::SmsDt).comment("SMS발송일시"))
          .col(string(TbAlmSmsHist::SmsRslt).string_len(30).comment("SMS발송결과"))
          .to_owned(),
      )
      .await
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager.drop_table(Table::drop().table(TbAlmSmsHist::Table).to_owned()).await
  }
}

#[derive(DeriveIden)]
enum TbAlmSmsHist {
  Table,
  AlmSmsHistSeq,
  SmsMsg,
  SmsDt,
  SmsRslt,
}
