use sea_orm_migration::{prelude::*, schema::*};

use crate::m20230423_083434_tb_grp::TbGrp;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .create_table(
        Table::create()
          .table(TbRegion::Table)
          .comment("맵지역")
          .if_not_exists()
          .col(pk_auto(TbRegion::RgSeq).comment("일련번호"))
          .col(string(TbRegion::RgNm).string_len(64).comment("이름"))
          .col(text(TbRegion::RgJson).comment("JSON"))
          .col(string(TbRegion::GrpId).string_len(30).default("R001").comment("그룹ID"))
          .foreign_key(
            ForeignKey::create()
              .from(TbRegion::Table, TbRegion::GrpId)
              .to(TbGrp::Table, TbGrp::GrpId)
              .on_delete(ForeignKeyAction::Cascade)
              .on_update(ForeignKeyAction::Cascade),
          )
          .to_owned(),
      )
      .await
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager.drop_table(Table::drop().table(TbRegion::Table).to_owned()).await
  }
}

#[derive(DeriveIden)]
enum TbRegion {
  Table,
  RgSeq,
  RgNm,
  RgJson,
  GrpId,
}
