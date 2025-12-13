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
          .table(TbConfig::Table)
          .comment("설정")
          .if_not_exists()
          .col(string(TbConfig::GrpId).string_len(30).primary_key().comment("그룹ID"))
          .col(double(TbConfig::DefLat).comment("기본위도"))
          .col(double(TbConfig::DefLng).comment("기본경도"))
          .col(float(TbConfig::DefZoom).comment("기본줌"))
          .foreign_key(
            ForeignKey::create()
              .from(TbConfig::Table, TbConfig::GrpId)
              .to(TbGrp::Table, TbGrp::GrpId)
              .on_delete(ForeignKeyAction::Cascade)
              .on_update(ForeignKeyAction::Cascade),
          )
          .to_owned(),
      )
      .await
      .unwrap();

    let insert = Query::insert()
      .into_table(TbConfig::Table)
      .columns([TbConfig::GrpId, TbConfig::DefLat, TbConfig::DefLng, TbConfig::DefZoom])
      .values_panic(["R001".into(), 37.7197513.into(), 127.1890969.into(), 15.9.into()])
      .to_owned();

    manager.exec_stmt(insert).await?;

    Ok(())
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager.drop_table(Table::drop().table(TbConfig::Table).to_owned()).await
  }
}

#[derive(DeriveIden)]
enum TbConfig {
  Table,
  GrpId,
  DefLat,
  DefLng,
  DefZoom,
}
