use sea_orm_migration::{prelude::*, schema::*, sea_orm::Statement};

use crate::{m20241204_142514_tb_gate::TbGate, m20250511_111851_tb_emcall::TbEmcall};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .create_table(
        Table::create()
          .table(TbGateEmcall::Table)
          .comment("게이트-E-Mcall 테이블")
          .if_not_exists()
          .col(integer(TbGateEmcall::GateSeq).comment("게이트일련번호"))
          .col(integer(TbGateEmcall::EmcallSeq).comment("E-Mcall일련번호"))
          .foreign_key(
            ForeignKey::create()
              .from(TbGateEmcall::Table, TbGateEmcall::GateSeq)
              .to(TbGate::Table, TbGate::GateSeq)
              .on_delete(ForeignKeyAction::Cascade)
              .on_update(ForeignKeyAction::Cascade),
          )
          .foreign_key(
            ForeignKey::create()
              .from(TbGateEmcall::Table, TbGateEmcall::EmcallSeq)
              .to(TbEmcall::Table, TbEmcall::EmcallSeq)
              .on_delete(ForeignKeyAction::Cascade)
              .on_update(ForeignKeyAction::Cascade),
          )
          .to_owned(),
      )
      .await?;

    let sql = "ALTER TABLE tb_gate_emcall ADD CONSTRAINT tb_gate_emcall_pk PRIMARY KEY (gate_seq, emcall_seq)";
    let stmt = Statement::from_string(manager.get_database_backend(), sql.to_owned());
    manager.get_connection().execute(stmt).await.map(|_| ()).unwrap();

    Ok(())
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager.drop_table(Table::drop().table(TbGateEmcall::Table).to_owned()).await
  }
}

#[derive(DeriveIden)]
pub enum TbGateEmcall {
  Table,
  GateSeq,
  EmcallSeq,
}
