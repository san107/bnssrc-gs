use sea_orm_migration::{prelude::*, schema::*};

use crate::m20241231_074134_tb_file::TbFile;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .create_table(
        Table::create()
          .table(TbFileTmp::Table)
          .comment("파일 임시 테이블")
          .if_not_exists()
          .col(integer(TbFileTmp::FileSeq).primary_key().comment("파일일련번호"))
          .col(
            date_time(TbFileTmp::UpdateDt)
              .extra("DEFAULT CURRENT_TIMESTAMP".to_string())
              .comment("수정일시"),
          )
          .foreign_key(
            ForeignKey::create()
              .from(TbFileTmp::Table, TbFileTmp::FileSeq)
              .to(TbFile::Table, TbFile::FileSeq)
              .on_delete(ForeignKeyAction::Cascade)
              .on_update(ForeignKeyAction::Cascade),
          )
          .to_owned(),
      )
      .await
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager.drop_table(Table::drop().table(TbFileTmp::Table).to_owned()).await
  }
}

#[derive(DeriveIden)]
enum TbFileTmp {
  Table,
  FileSeq,
  UpdateDt,
}
