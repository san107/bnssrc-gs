use sea_orm_migration::{prelude::*, schema::*};

use crate::{m20250517_104758_tb_ebrd::TbEbrd, m20250702_130847_tcm_flud_board::TcmFludBoard};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .create_table(
        Table::create()
          .table(TbNdmsMapEbrd::Table)
          .comment("전광판NDMS매핑")
          .if_not_exists()
          .col(string_len(TbNdmsMapEbrd::Flcode, 10).comment("침수지점코드"))
          .col(integer(TbNdmsMapEbrd::CdDistBoard).comment("전광판순번"))
          .primary_key(Index::create().col(TbNdmsMapEbrd::Flcode).col(TbNdmsMapEbrd::CdDistBoard))
          .col(integer(TbNdmsMapEbrd::EbrdSeq).comment("전광판일련번호"))
          .foreign_key(
            ForeignKey::create()
              .from(TbNdmsMapEbrd::Table, (TbNdmsMapEbrd::Flcode, TbNdmsMapEbrd::CdDistBoard))
              .to(TcmFludBoard::Table, (TcmFludBoard::Flcode, TcmFludBoard::CdDistBoard))
              .on_delete(ForeignKeyAction::Cascade)
              .on_update(ForeignKeyAction::Cascade),
          )
          .foreign_key(
            ForeignKey::create()
              .from(TbNdmsMapEbrd::Table, TbNdmsMapEbrd::EbrdSeq)
              .to(TbEbrd::Table, TbEbrd::EbrdSeq)
              .on_delete(ForeignKeyAction::Cascade)
              .on_update(ForeignKeyAction::Cascade),
          )
          .to_owned(),
      )
      .await
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager.drop_table(Table::drop().table(TbNdmsMapEbrd::Table).to_owned()).await
  }
}

#[derive(DeriveIden)]
enum TbNdmsMapEbrd {
  Table,
  Flcode,
  CdDistBoard,
  EbrdSeq,
}
