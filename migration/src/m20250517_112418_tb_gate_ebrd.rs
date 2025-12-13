use sea_orm_migration::{prelude::*, schema::*, sea_orm::Statement};

use crate::{m20241204_142514_tb_gate::TbGate, m20250517_104758_tb_ebrd::TbEbrd};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .create_table(
        Table::create()
          .table(TbGateEbrd::Table)
          .comment("게이트-EBRD 테이블")
          .if_not_exists()
          .col(integer(TbGateEbrd::GateSeq).comment("게이트일련번호"))
          .col(integer(TbGateEbrd::EbrdSeq).comment("EBRD일련번호"))
          .foreign_key(
            ForeignKey::create()
              .from(TbGateEbrd::Table, TbGateEbrd::GateSeq)
              .to(TbGate::Table, TbGate::GateSeq)
              .on_delete(ForeignKeyAction::Cascade)
              .on_update(ForeignKeyAction::Cascade),
          )
          .foreign_key(
            ForeignKey::create()
              .from(TbGateEbrd::Table, TbGateEbrd::EbrdSeq)
              .to(TbEbrd::Table, TbEbrd::EbrdSeq)
              .on_delete(ForeignKeyAction::Cascade)
              .on_update(ForeignKeyAction::Cascade),
          )
          .to_owned(),
      )
      .await?;

    let sql = "ALTER TABLE tb_gate_ebrd ADD CONSTRAINT tb_gate_ebrd_pk PRIMARY KEY (gate_seq, ebrd_seq)";
    let stmt = Statement::from_string(manager.get_database_backend(), sql.to_owned());
    manager.get_connection().execute(stmt).await.map(|_| ()).unwrap();

    Ok(())
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager.drop_table(Table::drop().table(TbGateEbrd::Table).to_owned()).await
  }
}

#[derive(DeriveIden)]
enum TbGateEbrd {
  Table,
  GateSeq,
  EbrdSeq,
}
