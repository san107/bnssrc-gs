use sea_orm_migration::{prelude::*, schema::*};
#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    // Replace the sample below with your own migration scripts
    manager
      .create_table(
        Table::create()
          .table(TbGateHist::Table)
          .comment("차단기이력")
          .if_not_exists()
          .col(pk_auto(TbGateHist::GateHistSeq).comment("차단기이력일련번호"))
          .col(integer(TbGateHist::GateSeq).comment("게이트일련번호"))
          .col(string(TbGateHist::GateStat).string_len(30).comment("차단기상태"))
          .col(string(TbGateHist::CmdReq).string_len(30).comment("명령처리요청"))
          .col(string(TbGateHist::CmdRslt).string_len(30).comment("명령처리결과GR"))
          .col(
            string(TbGateHist::CmdRsltMsg)
              .string_len(256)
              .null()
              .comment("명령어실행결과메시지"),
          )
          .col(
            date_time(TbGateHist::UpdateDt)
              .extra("DEFAULT CURRENT_TIMESTAMP".to_string())
              .comment("수정일시"),
          )
          .to_owned(),
      )
      .await
      .unwrap();

    // let insert = Query::insert()
    //   .into_table(TbGateHist::Table)
    //   .columns([
    //     TbGateHist::GateSeq,
    //     TbGateHist::GateStat,
    //     TbGateHist::CmdReq,
    //     TbGateHist::CmdRslt,
    //     TbGateHist::CmdRsltMsg,
    //   ])
    //   .values_panic([2.into(), "Na".into(), "Up".into(), "Fail".into(), "Timee OUt".into()])
    //   .values_panic([3.into(), "DownOk".into(), "Down".into(), "Success".into(), "".into()])
    //   .values_panic([
    //     3.into(),
    //     "Na".into(),
    //     "Up".into(),
    //     "Fail".into(),
    //     "Socket Connection Fail".into(),
    //   ])
    //   .values_panic([2.into(), "Na".into(), "Down".into(), "Fail".into(), "".into()])
    //   .values_panic([2.into(), "DownOk".into(), "Down".into(), "Success".into(), "".into()])
    //   .values_panic([2.into(), "Na".into(), "Up".into(), "Fail".into(), "".into()])
    //   .values_panic([3.into(), "DownOk".into(), "Down".into(), "Success".into(), "".into()])
    //   .values_panic([3.into(), "UpOk".into(), "Up".into(), "Success".into(), "".into()])
    //   .values_panic([2.into(), "DownOk".into(), "Down".into(), "Success".into(), "".into()])
    //   .to_owned();

    // manager.exec_stmt(insert).await?;

    Ok(())
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    // Replace the sample below with your own migration scripts
    manager.drop_table(Table::drop().table(TbGateHist::Table).to_owned()).await
  }
}

#[derive(DeriveIden)]
enum TbGateHist {
  Table,
  GateHistSeq,
  GateSeq,
  GateStat,
  CmdReq,  // 처리 요청
  CmdRslt, // 처리 결과
  CmdRsltMsg,
  UpdateDt,
}
