use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .create_table(
        Table::create()
          .table(TbLog::Table)
          .comment("로그 테이블")
          .if_not_exists()
          .col(pk_auto(TbLog::LogSeq).comment("로그 일련번호"))
          .col(string(TbLog::UserId).string_len(32).comment("사용자 아이디"))
          .col(string(TbLog::LogLevel).string_len(30).comment("로그 레벨"))
          .col(string(TbLog::LogMsg).string_len(1024).comment("로그 메시지"))
          .col(string(TbLog::LogDataJson).string_len(10240).comment("로그 데이터 JSON"))
          .col(date_time(TbLog::LogDt).comment("로그 일시"))
          .col(string(TbLog::LogType).string_len(30).comment("로그 타입"))
          .to_owned(),
      )
      .await
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager.drop_table(Table::drop().table(TbLog::Table).to_owned()).await
  }
}

#[derive(DeriveIden)]
enum TbLog {
  Table,
  LogSeq,
  UserId,
  LogLevel,
  LogType,
  LogMsg,
  LogDataJson,
  LogDt,
}
