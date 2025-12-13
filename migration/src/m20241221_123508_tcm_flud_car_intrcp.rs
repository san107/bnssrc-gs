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
          .table(TcmFludCarIntrcp::Table)
          .comment("차량제어기정보")
          .if_not_exists()
          .col(char(TcmFludCarIntrcp::Flcode).char_len(10).comment("침수지점코드"))
          .col(integer(TcmFludCarIntrcp::CdDistIntrcp).comment("차량제어기순번4"))
          .col(
            string(TcmFludCarIntrcp::NmDistIntrcp)
              .string_len(100)
              .null()
              .comment("차량제어기명칭"),
          )
          .col(string(TcmFludCarIntrcp::GbIntrcp).string_len(1).null().comment("진출입유형"))
          .col(
            string(TcmFludCarIntrcp::ModIntrcp)
              .string_len(1)
              .null()
              .comment("재난시차단기모드"),
          )
          .col(string(TcmFludCarIntrcp::CommSttus).string_len(1).null().comment("통신상태"))
          .col(
            string(TcmFludCarIntrcp::IntrcpSttus)
              .string_len(1)
              .null()
              .comment("차단기상태"),
          )
          .col(double(TcmFludCarIntrcp::Lat).null().comment("위도10,7"))
          .col(double(TcmFludCarIntrcp::Lon).null().comment("경도10,7"))
          .col(string(TcmFludCarIntrcp::Rm).string_len(1000).null().comment("비고"))
          .col(char(TcmFludCarIntrcp::UseYn).char_len(1).comment("사용여부"))
          .col(date_time(TcmFludCarIntrcp::Rgsde).comment("최초등록일시"))
          .col(date_time(TcmFludCarIntrcp::Updde).comment("최종수정일시"))
          .to_owned(),
      )
      .await
      .unwrap();

    // 여러개의 primary key 지정했을 때 오류가 나서, sql로 실행해줌.
    let sql = "ALTER TABLE tcm_flud_car_intrcp ADD CONSTRAINT tcm_flud_car_intrcp_pk PRIMARY KEY (FLCODE, CD_DIST_INTRCP)";
    let stmt = Statement::from_string(manager.get_database_backend(), sql.to_owned());
    manager.get_connection().execute(stmt).await.map(|_| ()).unwrap();

    Ok(())
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .drop_table(Table::drop().table(TcmFludCarIntrcp::Table).to_owned())
      .await
  }
}

#[derive(DeriveIden)]
pub enum TcmFludCarIntrcp {
  Table,
  #[sea_orm(iden = "FLCODE")]
  Flcode,
  #[sea_orm(iden = "CD_DIST_INTRCP")]
  CdDistIntrcp,
  #[sea_orm(iden = "NM_DIST_INTRCP")]
  NmDistIntrcp,
  #[sea_orm(iden = "GB_INTRCP")]
  GbIntrcp,
  #[sea_orm(iden = "MOD_INTRCP")]
  ModIntrcp,
  #[sea_orm(iden = "COMM_STTUS")]
  CommSttus,
  #[sea_orm(iden = "INTRCP_STTUS")]
  IntrcpSttus,
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
