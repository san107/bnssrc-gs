use crate::m20241231_074134_tb_file::TbFile;
use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .create_table(
        Table::create()
          .table(TbBoard::Table)
          .comment("게시판")
          .if_not_exists()
          .col(pk_auto(TbBoard::BdSeq).comment("게시판일련번호"))
          .col(integer(TbBoard::DispSeq).null().comment("표시순서"))
          .col(string(TbBoard::BdTitle).string_len(500).comment("게시판제목"))
          .col(string(TbBoard::BdContents).null().string_len(4000).comment("게시판내용"))
          .col(date_time(TbBoard::BdCreateDt).comment("게시판생성일시"))
          .col(date_time(TbBoard::BdUpdateDt).comment("게시판수정일시"))
          .col(integer(TbBoard::BdViews).null().comment("게시판조회수"))
          .col(string(TbBoard::BdType).string_len(30).comment("게시판유형"))
          .col(string(TbBoard::UserId).string_len(32).comment("작성자ID"))
          .col(integer(TbBoard::FileSeq).null().comment("파일일련번호"))
          // .foreign_key(
          //   ForeignKey::create()
          //     .from(TbBoard::Table, TbBoard::UserId)
          //     .to(TbLogin::Table, TbLogin::UserId)
          //   //   .on_delete(ForeignKeyAction::Cascade)
          //   //   .on_update(ForeignKeyAction::Cascade),
          // )
          .foreign_key(
            ForeignKey::create()
              .from(TbBoard::Table, TbBoard::FileSeq)
              .to(TbFile::Table, TbFile::FileSeq)
              .on_delete(ForeignKeyAction::Cascade)
              .on_update(ForeignKeyAction::Cascade),
          )
          .to_owned(),
      )
      .await
      .unwrap();

    Ok(())
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager.drop_table(Table::drop().table(TbBoard::Table).to_owned()).await
  }
}

#[derive(DeriveIden)]
pub enum TbBoard {
  Table,
  BdSeq,
  DispSeq,
  BdTitle,
  BdContents,
  BdCreateDt,
  BdUpdateDt,
  BdViews,
  BdType,
  UserId,
  FileSeq,
}
