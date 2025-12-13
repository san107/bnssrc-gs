use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .create_table(
        Table::create()
          .table(TbMsg::Table)
          .comment("메시지")
          .if_not_exists()
          .col(pk_auto(TbMsg::MsgSeq).comment("일련번호"))
          .col(string(TbMsg::MsgTxt).string_len(1024).comment("내용"))
          .to_owned(),
      )
      .await
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager.drop_table(Table::drop().table(TbMsg::Table).to_owned()).await
  }
}

#[derive(DeriveIden)]
enum TbMsg {
  Table,
  MsgSeq,
  MsgTxt,
}
