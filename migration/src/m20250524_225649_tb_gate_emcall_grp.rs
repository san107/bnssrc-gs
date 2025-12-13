use sea_orm_migration::{prelude::*, schema::*, sea_orm::Statement};

use crate::{m20241204_142514_tb_gate::TbGate, m20250511_111759_tb_emcall_grp::TbEmcallGrp};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .create_table(
        Table::create()
          .table(TbGateEmcallGrp::Table)
          .comment("차단기 차단시 송출그룹")
          .if_not_exists()
          .col(integer(TbGateEmcallGrp::GateSeq).comment("차단기 일련번호"))
          .col(integer(TbGateEmcallGrp::EmcallGrpSeq).comment("송출그룹 일련번호"))
          .foreign_key(
            ForeignKey::create()
              .from(TbGateEmcallGrp::Table, TbGateEmcallGrp::GateSeq)
              .to(TbGate::Table, TbGate::GateSeq)
              .on_delete(ForeignKeyAction::Cascade)
              .on_update(ForeignKeyAction::Cascade),
          )
          .foreign_key(
            ForeignKey::create()
              .from(TbGateEmcallGrp::Table, TbGateEmcallGrp::EmcallGrpSeq)
              .to(TbEmcallGrp::Table, TbEmcallGrp::EmcallGrpSeq)
              .on_delete(ForeignKeyAction::Cascade)
              .on_update(ForeignKeyAction::Cascade),
          )
          .to_owned(),
      )
      .await?;

    let sql = "ALTER TABLE tb_gate_emcall_grp ADD CONSTRAINT tb_gate_emcall_grp_pk PRIMARY KEY (gate_seq, emcall_grp_seq)";
    let stmt = Statement::from_string(manager.get_database_backend(), sql.to_owned());
    manager.get_connection().execute(stmt).await.map(|_| ()).unwrap();

    Ok(())
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .drop_table(Table::drop().table(TbGateEmcallGrp::Table).to_owned())
      .await
  }
}

#[derive(DeriveIden)]
enum TbGateEmcallGrp {
  Table,
  GateSeq,
  EmcallGrpSeq,
}
