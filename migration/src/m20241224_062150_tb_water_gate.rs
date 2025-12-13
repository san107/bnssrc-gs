use sea_orm::Statement;
use sea_orm_migration::{prelude::*, schema::*};

use crate::{m20241204_141048_tb_water::TbWater, m20241204_142514_tb_gate::TbGate};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .create_table(
        Table::create()
          .table(TbWaterGate::Table)
          .comment("수위게이트")
          .if_not_exists()
          .col(integer(TbWaterGate::WaterSeq).comment("수위일련번호"))
          .col(integer(TbWaterGate::GateSeq).comment("게이트일련번호"))
          .foreign_key(
            ForeignKey::create()
              .from(TbWaterGate::Table, TbWaterGate::WaterSeq)
              .to(TbWater::Table, TbWater::WaterSeq)
              .on_delete(ForeignKeyAction::Cascade)
              .on_update(ForeignKeyAction::Cascade),
          )
          .foreign_key(
            ForeignKey::create()
              .from(TbWaterGate::Table, TbWaterGate::GateSeq)
              .to(TbGate::Table, TbGate::GateSeq)
              .on_delete(ForeignKeyAction::Cascade)
              .on_update(ForeignKeyAction::Cascade),
          )
          .to_owned(),
      )
      .await
      .unwrap();

    let sql = "ALTER TABLE tb_water_gate ADD CONSTRAINT tb_water_gate_pk PRIMARY KEY (water_seq, gate_seq)";
    let stmt = Statement::from_string(manager.get_database_backend(), sql.to_owned());
    manager.get_connection().execute(stmt).await.map(|_| ()).unwrap();

    // let insert = Query::insert()
    //   .into_table(TbWaterGate::Table)
    //   .columns([TbWaterGate::WaterSeq, TbWaterGate::GateSeq])
    //   .values_panic([1.into(), 1.into()])
    //   .values_panic([1.into(), 3.into()])
    //   .values_panic([2.into(), 2.into()])
    //   .values_panic([2.into(), 4.into()])
    //   .values_panic([2.into(), 5.into()])
    //   .values_panic([3.into(), 6.into()])
    //   .values_panic([3.into(), 7.into()])
    //   .values_panic([4.into(), 6.into()])
    //   .values_panic([4.into(), 7.into()])
    //   .to_owned();

    // manager.exec_stmt(insert).await?;

    Ok(())
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager.drop_table(Table::drop().table(TbWaterGate::Table).to_owned()).await
  }
}

#[derive(DeriveIden)]
enum TbWaterGate {
  Table,
  WaterSeq,
  GateSeq,
}
