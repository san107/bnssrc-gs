use sea_orm_migration::{prelude::*, schema::*, sea_orm::Statement};

use crate::{m20241204_142514_tb_gate::TbGate, m20241221_123508_tcm_flud_car_intrcp::TcmFludCarIntrcp};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    _ = manager
      .create_table(
        Table::create()
          .table(TbNdmsMapGate::Table)
          .comment("차단기NDMS매핑")
          .if_not_exists()
          .col(string(TbNdmsMapGate::Flcode).string_len(32).comment("침수지점코드"))
          .col(integer(TbNdmsMapGate::CdDistIntrcp).comment("차량제어기순번"))
          .col(integer(TbNdmsMapGate::GateSeq).comment("차단기일련번호"))
          .foreign_key(
            ForeignKey::create()
              .from(TbNdmsMapGate::Table, (TbNdmsMapGate::Flcode, TbNdmsMapGate::CdDistIntrcp))
              .to(
                TcmFludCarIntrcp::Table,
                (TcmFludCarIntrcp::Flcode, TcmFludCarIntrcp::CdDistIntrcp),
              )
              .on_delete(ForeignKeyAction::Cascade)
              .on_update(ForeignKeyAction::Cascade),
          )
          .foreign_key(
            ForeignKey::create()
              .from(TbNdmsMapGate::Table, TbNdmsMapGate::GateSeq)
              .to(TbGate::Table, TbGate::GateSeq)
              .on_delete(ForeignKeyAction::Cascade)
              .on_update(ForeignKeyAction::Cascade),
          )
          .to_owned(),
      )
      .await;

    let sql = "ALTER TABLE tb_ndms_map_gate ADD CONSTRAINT tb_ndms_map_gate_pk PRIMARY KEY (flcode, cd_dist_intrcp)";
    let stmt = Statement::from_string(manager.get_database_backend(), sql.to_owned());
    manager.get_connection().execute(stmt).await.map(|_| ()).unwrap();
    Ok(())
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager.drop_table(Table::drop().table(TbNdmsMapGate::Table).to_owned()).await
  }
}

#[derive(DeriveIden)]
enum TbNdmsMapGate {
  Table,
  Flcode,
  CdDistIntrcp,
  GateSeq,
}
