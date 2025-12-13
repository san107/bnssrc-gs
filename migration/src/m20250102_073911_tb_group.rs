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
          .table(TbGroup::Table)
          .comment("그룹")
          .if_not_exists()
          .col(pk_auto(TbGroup::GrpSeq).comment("일련번호"))
          .col(string(TbGroup::GrpType).string_len(64).comment("타입"))
          .col(string(TbGroup::GrpNm).string_len(64).comment("그룹명"))
          .col(string(TbGroup::GrpId).string_len(30).default("R001").comment("그룹ID"))
          .foreign_key(
            ForeignKey::create()
              .from(TbGroup::Table, TbGroup::GrpId)
              .to(TbGrp::Table, TbGrp::GrpId)
              .on_delete(ForeignKeyAction::Cascade)
              .on_update(ForeignKeyAction::Cascade),
          )
          .to_owned(),
      )
      .await
      .unwrap();

    // let insert = Query::insert()
    //   .into_table(TbGroup::Table)
    //   .columns([TbGroup::GrpType, TbGroup::GrpNm])
    //   .values_panic(["gate".into(), "오토 게이트".into()])
    //   .values_panic(["gate".into(), "이츠온".into()])
    //   .values_panic(["gate".into(), "개방형".into()])
    //   .to_owned();

    // manager.exec_stmt(insert).await?;

    Ok(())
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager.drop_table(Table::drop().table(TbGroup::Table).to_owned()).await
  }
}

#[derive(DeriveIden)]
pub enum TbGroup {
  Table,
  GrpSeq,
  GrpType,
  GrpNm,
  GrpId,
}
