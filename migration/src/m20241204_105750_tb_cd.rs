use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .create_table(
        Table::create()
          .table(TbCd::Table)
          .comment("코드")
          .if_not_exists()
          .col(string(TbCd::Cd).string_len(30).primary_key().comment("코드"))
          .col(string(TbCd::CdGrp).string_len(30).comment("코드그룹"))
          .col(string(TbCd::CdId).string_len(30).comment("코드ID"))
          .col(string(TbCd::CdNm).string_len(64).comment("코드명"))
          .col(integer(TbCd::CdSeq).null().comment("표시순서"))
          .to_owned(),
      )
      .await
      .unwrap();

    Ok(())
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager.drop_table(Table::drop().table(TbCd::Table).to_owned()).await
  }
}

#[derive(DeriveIden)]
pub enum TbCd {
  Table,
  Cd,
  CdGrp,
  CdId,
  CdNm,
  CdSeq,
}
