use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .create_table(
        Table::create()
          .table(TcmFludSpot::Table)
          .comment("침수지점정보")
          .if_not_exists()
          .col(char(TcmFludSpot::Flcode).char_len(10).primary_key().comment("침수지점코드"))
          .col(string(TcmFludSpot::Flname).string_len(100).comment("침수지점명"))
          .col(string(TcmFludSpot::Fladdr).string_len(200).comment("상세주소"))
          .col(string(TcmFludSpot::BdongCd).string_len(10).comment("법정동코드"))
          .col(double(TcmFludSpot::Lat).null().comment("위도10,7"))
          .col(double(TcmFludSpot::Lon).null().comment("경도10,7"))
          .col(double(TcmFludSpot::AdvsryWal).null().comment("주의보기준수위5,3"))
          .col(double(TcmFludSpot::AlarmWal).null().comment("경보기준수위5,3"))
          .col(double(TcmFludSpot::FludWal).null().comment("침수기준수위5,3"))
          .col(string(TcmFludSpot::Rm).string_len(1000).null().comment("비고"))
          .col(char(TcmFludSpot::Admcode).char_len(5).comment("관리기관코드"))
          .col(char(TcmFludSpot::UseYn).char_len(1).comment("사용여부"))
          .col(date_time(TcmFludSpot::Rgsde).comment("최초등록일시"))
          .col(date_time(TcmFludSpot::Updde).comment("최종수정일시"))
          .to_owned(),
      )
      .await
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager.drop_table(Table::drop().table(TcmFludSpot::Table).to_owned()).await
  }
}

#[derive(DeriveIden)]
enum TcmFludSpot {
  Table,
  #[sea_orm(iden = "FLCODE")]
  Flcode,
  #[sea_orm(iden = "FLNAME")]
  Flname,
  #[sea_orm(iden = "FLADDR")]
  Fladdr,
  #[sea_orm(iden = "BDONG_CD")]
  BdongCd,
  #[sea_orm(iden = "LAT")]
  Lat,
  #[sea_orm(iden = "LON")]
  Lon,
  #[sea_orm(iden = "ADVSRY_WAL")]
  AdvsryWal,
  #[sea_orm(iden = "ALARM_WAL")]
  AlarmWal,
  #[sea_orm(iden = "FLUD_WAL")]
  FludWal,
  #[sea_orm(iden = "RM")]
  Rm,
  #[sea_orm(iden = "ADMCODE")]
  Admcode,
  #[sea_orm(iden = "USE_YN")]
  UseYn,
  #[sea_orm(iden = "RGSDE")]
  Rgsde,
  #[sea_orm(iden = "UPDDE")]
  Updde,
}
