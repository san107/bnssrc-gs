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
          .table(TcmFludWal::Table)
          .comment("수위측정소정보")
          .if_not_exists()
          .col(char(TcmFludWal::Flcode).char_len(10).comment("침수지점코드"))
          .col(integer(TcmFludWal::CdDistWal).comment("수위측정소순번4"))
          .col(string(TcmFludWal::NmDistWal).string_len(100).comment("차량제어기명칭"))
          .col(string(TcmFludWal::GbWal).string_len(1).null().comment("수집유형"))
          .col(string(TcmFludWal::LastColctDe).string_len(14).null().comment("최종수집일시"))
          .col(double(TcmFludWal::LastColctWal).null().comment("최종수집수위m5,3"))
          .col(double(TcmFludWal::Lat).null().comment("위도10,7"))
          .col(double(TcmFludWal::Lon).null().comment("경도10,7"))
          .col(string(TcmFludWal::Rm).string_len(1000).null().comment("비고"))
          .col(char(TcmFludWal::UseYn).char_len(1).comment("사용여부"))
          .col(date_time(TcmFludWal::Rgsde).comment("최초등록일시"))
          .col(date_time(TcmFludWal::Updde).comment("최종수정일시"))
          .to_owned(),
      )
      .await
      .unwrap();

    // 여러개의 primary key 지정했을 때 오류가 나서, sql로 실행해줌.
    let sql = "ALTER TABLE tcm_flud_wal ADD CONSTRAINT tcm_flud_wal_pk PRIMARY KEY (FLCODE, CD_DIST_WAL)";
    let stmt = Statement::from_string(manager.get_database_backend(), sql.to_owned());
    manager.get_connection().execute(stmt).await.map(|_| ()).unwrap();

    Ok(())
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager.drop_table(Table::drop().table(TcmFludWal::Table).to_owned()).await
  }
}

#[derive(DeriveIden)]
pub enum TcmFludWal {
  Table,
  #[sea_orm(iden = "FLCODE")]
  Flcode,
  #[sea_orm(iden = "CD_DIST_WAL")]
  CdDistWal,
  #[sea_orm(iden = "NM_DIST_WAL")]
  NmDistWal,
  #[sea_orm(iden = "GB_WAL")]
  GbWal,
  #[sea_orm(iden = "LAST_COLCT_DE")]
  LastColctDe,
  #[sea_orm(iden = "LAST_COLCT_WAL")]
  LastColctWal,
  #[sea_orm(iden = "LAT")]
  Lat,
  #[sea_orm(iden = "LON")]
  Lon,
  #[sea_orm(iden = "RM")]
  Rm,
  #[sea_orm(iden = "USE_YN")]
  UseYn,
  #[sea_orm(iden = "RGSDE")]
  Rgsde,
  #[sea_orm(iden = "UPDDE")]
  Updde,
}
