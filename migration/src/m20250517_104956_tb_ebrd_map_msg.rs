use sea_orm_migration::{prelude::*, schema::*, sea_orm::Statement};

use crate::{m20250517_092505_tb_ebrd_msg::TbEbrdMsg, m20250517_104758_tb_ebrd::TbEbrd};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .create_table(
        Table::create()
          .table(TbEbrdMapMsg::Table)
          .comment("전광판 메시지 매핑")
          .if_not_exists()
          .col(integer(TbEbrdMapMsg::EbrdSeq).comment("전광판 일련번호"))
          .col(integer(TbEbrdMapMsg::EbrdMsgPos).comment("전광판 메시지 위치(방번호)"))
          .col(integer(TbEbrdMapMsg::EbrdMsgSeq).comment("전광판 메시지 일련번호"))
          .col(string(TbEbrdMapMsg::SendStat).string_len(30).comment("전송상태"))
          .col(string(TbEbrdMapMsg::SendRslt).string_len(30).comment("전송결과"))
          .col(date_time(TbEbrdMapMsg::SendDt).null().comment("전송일시"))
          .foreign_key(
            ForeignKey::create()
              .from(TbEbrdMapMsg::Table, TbEbrdMapMsg::EbrdSeq)
              .to(TbEbrd::Table, TbEbrd::EbrdSeq)
              .on_delete(ForeignKeyAction::Cascade)
              .on_update(ForeignKeyAction::Cascade),
          )
          .foreign_key(
            ForeignKey::create()
              .from(TbEbrdMapMsg::Table, TbEbrdMapMsg::EbrdMsgSeq)
              .to(TbEbrdMsg::Table, TbEbrdMsg::EbrdMsgSeq)
              .on_delete(ForeignKeyAction::Cascade)
              .on_update(ForeignKeyAction::Cascade),
          )
          .to_owned(),
      )
      .await?;

    let sql = "ALTER TABLE tb_ebrd_map_msg ADD CONSTRAINT tb_ebrd_map_msg_pk PRIMARY KEY (ebrd_seq, ebrd_msg_pos)";
    let stmt = Statement::from_string(manager.get_database_backend(), sql.to_owned());
    manager.get_connection().execute(stmt).await.map(|_| ()).unwrap();

    Ok(())
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager.drop_table(Table::drop().table(TbEbrdMapMsg::Table).to_owned()).await
  }
}

#[derive(DeriveIden)]
pub enum TbEbrdMapMsg {
  Table,
  EbrdSeq,
  EbrdMsgPos,
  EbrdMsgSeq,
  SendStat,
  SendRslt,
  SendDt,
}
