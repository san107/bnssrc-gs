use sea_orm::Statement;
use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .create_table(
        Table::create()
          .table(TcmFludAlmord::Table)
          .comment("침수경보발령정보")
          .if_not_exists()
          .col(char(TcmFludAlmord::Flcode).char_len(10).comment("침수지점코드"))
          .col(integer(TcmFludAlmord::CdDistIntrcp).comment("차량제어기순번4"))
          .col(string(TcmFludAlmord::Sttusde).string_len(14).comment("상태변경일시"))
          .col(string(TcmFludAlmord::IntrcpSttus).string_len(1).comment("차단기상태"))
          .col(string(TcmFludAlmord::Rm).string_len(1000).null().comment("비고"))
          .col(char(TcmFludAlmord::Admcode).char_len(5).comment("관리기관코드"))
          .col(date_time(TcmFludAlmord::Rgsde).comment("최초등록일시"))
          .col(date_time(TcmFludAlmord::Updde).comment("최종수정일시"))
          .to_owned(),
      )
      .await
      .unwrap();

    // 여러개의 primary key 지정했을 때 오류가 나서, sql로 실행해줌.
    let sql =
      "ALTER TABLE tcm_flud_almord ADD CONSTRAINT tcm_flud_almord_pk PRIMARY KEY (FLCODE, CD_DIST_INTRCP, STTUSDE, INTRCP_STTUS)";
    let stmt = Statement::from_string(manager.get_database_backend(), sql.to_owned());
    manager.get_connection().execute(stmt).await.map(|_| ()).unwrap();

    Ok(())
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager.drop_table(Table::drop().table(TcmFludAlmord::Table).to_owned()).await
  }
}

#[derive(DeriveIden)]
enum TcmFludAlmord {
  Table,
  #[sea_orm(iden = "FLCODE")]
  Flcode,
  #[sea_orm(iden = "CD_DIST_INTRCP")]
  CdDistIntrcp,
  #[sea_orm(iden = "STTUSDE")]
  Sttusde,
  #[sea_orm(iden = "INTRCP_STTUS")]
  IntrcpSttus,
  #[sea_orm(iden = "RM")]
  Rm,
  #[sea_orm(iden = "ADMCODE")]
  Admcode,
  #[sea_orm(iden = "RGSDE")]
  Rgsde,
  #[sea_orm(iden = "UPDDE")]
  Updde,
}
