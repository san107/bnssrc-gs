use sea_orm_migration::{prelude::*, schema::*};

use crate::m20230423_083434_tb_grp::TbGrp;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    // Replace the sample below with your own migration scripts
    manager
      .create_table(
        Table::create()
          .table(TbLogin::Table)
          .comment("사용자")
          .if_not_exists()
          .col(string(TbLogin::UserId).string_len(32).primary_key().comment("사용자ID"))
          .col(string(TbLogin::UserName).string_len(32).comment("사용자명"))
          .col(string(TbLogin::UserPass).string_len(256).comment("비밀번호"))
          .col(string(TbLogin::UserEmail).string_len(64).comment("이메일"))
          .col(
            string(TbLogin::UserRole)
              .string_len(30)
              .comment("역할:Admin, User, Inst(설치권한)"),
          )
          .col(string(TbLogin::GrpId).string_len(30).default("R001").comment("그룹ID"))
          .foreign_key(
            ForeignKey::create()
              .from(TbLogin::Table, TbLogin::GrpId)
              .to(TbGrp::Table, TbGrp::GrpId)
              .on_delete(ForeignKeyAction::Cascade)
              .on_update(ForeignKeyAction::Cascade),
          )
          .to_owned(),
      )
      .await?;

    let insert = Query::insert()
      .into_table(TbLogin::Table)
      .columns([
        TbLogin::UserId,
        TbLogin::UserName,
        TbLogin::UserPass,
        TbLogin::UserEmail,
        TbLogin::UserRole,
      ])
      .values_panic(
        [
          "inst",
          "inst",
          "$2b$12$lMwNmkIaODHn7UxPA5tcAOxVOjSkNAU3SGWdB4uCAXuKswmhpQoim",
          "inst@bnstech.com",
          "Inst",
        ]
        .map(|ele| ele.into()),
      )
      .values_panic(
        [
          "admin",
          "admin",
          "$2b$12$lMwNmkIaODHn7UxPA5tcAOxVOjSkNAU3SGWdB4uCAXuKswmhpQoim",
          "admin@bnstech.com",
          "Admin",
        ]
        .map(|ele| ele.into()),
      )
      .values_panic(
        [
          "user",
          "user",
          "$2b$12$/oAdAwgKE7aOp7erBmYhyecnHtq4nSxgUQMivoGK.QowDkI.UOpqO",
          "user@bnstech.com",
          "User",
        ]
        .map(|ele| ele.into()),
      )
      .to_owned();

    manager.exec_stmt(insert).await?;

    Ok(())
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    // Replace the sample below with your own migration scripts
    manager.drop_table(Table::drop().table(TbLogin::Table).to_owned()).await
  }
}

#[derive(DeriveIden)]
pub enum TbLogin {
  Table,
  UserId,
  UserName,
  UserPass,
  UserEmail,
  UserRole,
  GrpId,
}
