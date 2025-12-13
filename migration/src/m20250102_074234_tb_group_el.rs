use sea_orm::Statement;
use sea_orm_migration::{prelude::*, schema::*};

use crate::m20250102_073911_tb_group::TbGroup;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .create_table(
        Table::create()
          .table(TbGroupEl::Table)
          .comment("그룹 요소 테이블")
          .if_not_exists()
          .col(integer(TbGroupEl::GrpSeq).comment("그룹 일련번호"))
          .col(integer(TbGroupEl::GrpElSeq).comment("그룹 요소 일련번호"))
          .foreign_key(
            ForeignKey::create()
              .from(TbGroupEl::Table, TbGroupEl::GrpSeq)
              .to(TbGroup::Table, TbGroup::GrpSeq)
              .on_delete(ForeignKeyAction::Cascade)
              .on_update(ForeignKeyAction::Cascade),
          )
          .to_owned(),
      )
      .await
      .unwrap();

    let sql = "ALTER TABLE tb_group_el ADD CONSTRAINT tb_group_el_pk PRIMARY KEY (grp_seq, grp_el_seq)";
    let stmt = Statement::from_string(manager.get_database_backend(), sql.to_owned());
    manager.get_connection().execute(stmt).await.map(|_| ()).unwrap();

    // let insert = Query::insert()
    //   .into_table(TbGroupEl::Table)
    //   .columns([TbGroupEl::GrpSeq, TbGroupEl::GrpElSeq])
    //   .values_panic([1.into(), 1.into()])
    //   .values_panic([1.into(), 2.into()])
    //   .values_panic([2.into(), 3.into()])
    //   .values_panic([3.into(), 4.into()])
    //   .values_panic([3.into(), 5.into()])
    //   .to_owned();

    // manager.exec_stmt(insert).await?;

    Ok(())
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager.drop_table(Table::drop().table(TbGroupEl::Table).to_owned()).await
  }
}

#[derive(DeriveIden)]
enum TbGroupEl {
  Table,
  GrpSeq,
  GrpElSeq,
}
