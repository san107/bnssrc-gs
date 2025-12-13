use sea_orm_migration::{prelude::*, schema::*, sea_orm::Statement};

use crate::{m20241204_141048_tb_water::TbWater, m20241221_125315_tcm_flud_wal::TcmFludWal};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    _ = manager
      .create_table(
        Table::create()
          .table(TbNdmsMapWater::Table)
          .comment("수위계NDMS매핑")
          .if_not_exists()
          .col(string(TbNdmsMapWater::Flcode).string_len(32).comment("침수지점코드"))
          .col(integer(TbNdmsMapWater::CdDistWal).comment("수위계순번"))
          .col(integer(TbNdmsMapWater::WaterSeq).comment("수위계일련번호"))
          .foreign_key(
            ForeignKey::create()
              .from(TbNdmsMapWater::Table, (TbNdmsMapWater::Flcode, TbNdmsMapWater::CdDistWal))
              .to(TcmFludWal::Table, (TcmFludWal::Flcode, TcmFludWal::CdDistWal))
              .on_delete(ForeignKeyAction::Cascade)
              .on_update(ForeignKeyAction::Cascade),
          )
          .foreign_key(
            ForeignKey::create()
              .from(TbNdmsMapWater::Table, TbNdmsMapWater::WaterSeq)
              .to(TbWater::Table, TbWater::WaterSeq)
              .on_delete(ForeignKeyAction::Cascade)
              .on_update(ForeignKeyAction::Cascade),
          )
          .to_owned(),
      )
      .await;

    let sql = "ALTER TABLE tb_ndms_map_water ADD CONSTRAINT tb_ndms_map_water_pk PRIMARY KEY (flcode, cd_dist_wal)";
    let stmt = Statement::from_string(manager.get_database_backend(), sql.to_owned());
    manager.get_connection().execute(stmt).await.map(|_| ()).unwrap();

    Ok(())
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .drop_table(Table::drop().table(TbNdmsMapWater::Table).to_owned())
      .await
  }
}

#[derive(DeriveIden)]
enum TbNdmsMapWater {
  Table,
  Flcode,
  CdDistWal,
  WaterSeq,
}
