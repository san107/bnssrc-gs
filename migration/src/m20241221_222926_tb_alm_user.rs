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
          .table(TbAlmUser::Table)
          .comment("알람사용자")
          .if_not_exists()
          .col(pk_auto(TbAlmUser::AlmUserSeq).comment("일련번호"))
          .col(string_len(TbAlmUser::AlmUserNm, 30).comment("이름"))
          .col(string_len(TbAlmUser::AlmUserDept, 30).comment("부서명"))
          .col(string_len(TbAlmUser::AlmUserMobile, 30).comment("휴대전화"))
          .col(string(TbAlmUser::GrpId).string_len(30).default("R001").comment("그룹ID"))
          .foreign_key(
            ForeignKey::create()
              .from(TbAlmUser::Table, TbAlmUser::GrpId)
              .to(TbGrp::Table, TbGrp::GrpId)
              .on_delete(ForeignKeyAction::Cascade)
              .on_update(ForeignKeyAction::Cascade),
          )
          .to_owned(),
      )
      .await
      .unwrap();

    let insert = Query::insert()
      .into_table(TbAlmUser::Table)
      .columns([TbAlmUser::AlmUserNm, TbAlmUser::AlmUserDept, TbAlmUser::AlmUserMobile])
      .values_panic(["박창주".into(), "운영팀".into(), "01094757661".into()])
      .values_panic(["이대운".into(), "운영팀".into(), "01071320397".into()])
      .to_owned();

    manager.exec_stmt(insert).await?;

    Ok(())
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager.drop_table(Table::drop().table(TbAlmUser::Table).to_owned()).await
  }
}

#[derive(DeriveIden)]
pub enum TbAlmUser {
  Table,
  AlmUserSeq,
  AlmUserNm,
  AlmUserDept,
  AlmUserMobile,
  GrpId,
}
