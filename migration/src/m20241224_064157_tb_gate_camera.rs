use sea_orm::Statement;
use sea_orm_migration::{prelude::*, schema::*};

use crate::{m20241204_135847_tb_camera::TbCamera, m20241204_142514_tb_gate::TbGate};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .create_table(
        Table::create()
          .table(TbGateCamera::Table)
          .comment("게이트카메라")
          .if_not_exists()
          .col(integer(TbGateCamera::GateSeq).comment("게이트일련번호"))
          .col(integer(TbGateCamera::CamSeq).comment("카메라일련번호"))
          .foreign_key(
            ForeignKey::create()
              .from(TbGateCamera::Table, TbGateCamera::CamSeq)
              .to(TbCamera::Table, TbCamera::CamSeq)
              .on_delete(ForeignKeyAction::Cascade)
              .on_update(ForeignKeyAction::Cascade),
          )
          .foreign_key(
            ForeignKey::create()
              .from(TbGateCamera::Table, TbGateCamera::GateSeq)
              .to(TbGate::Table, TbGate::GateSeq)
              .on_delete(ForeignKeyAction::Cascade)
              .on_update(ForeignKeyAction::Cascade),
          )
          .to_owned(),
      )
      .await
      .unwrap();

    let sql = "ALTER TABLE tb_gate_camera ADD CONSTRAINT tb_gate_camera_pk PRIMARY KEY (gate_seq, cam_seq)";
    let stmt = Statement::from_string(manager.get_database_backend(), sql.to_owned());
    manager.get_connection().execute(stmt).await.map(|_| ()).unwrap();

    // let insert = Query::insert()
    //   .into_table(TbGateCamera::Table)
    //   .columns([TbGateCamera::GateSeq, TbGateCamera::CamSeq])
    //   .values_panic([1.into(), 14.into()])
    //   .values_panic([2.into(), 14.into()])
    //   .values_panic([3.into(), 14.into()])
    //   .values_panic([3.into(), 6.into()])
    //   .values_panic([4.into(), 5.into()])
    //   .values_panic([4.into(), 6.into()])
    //   .values_panic([4.into(), 7.into()])
    //   .values_panic([5.into(), 4.into()])
    //   .values_panic([6.into(), 4.into()])
    //   .values_panic([7.into(), 9.into()])
    //   .values_panic([7.into(), 11.into()])
    //   .to_owned();

    // manager.exec_stmt(insert).await?;

    Ok(())
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager.drop_table(Table::drop().table(TbGateCamera::Table).to_owned()).await
  }
}

#[derive(DeriveIden)]
enum TbGateCamera {
  Table,
  GateSeq,
  CamSeq,
}
