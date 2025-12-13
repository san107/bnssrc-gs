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
          .table(TcmCouDngrAlmord::Table)
          .comment("위험경보발령 정보")
          .if_not_exists()
          .col(
            char(TcmCouDngrAlmord::Dscode)
              .char_len(10)
              .comment("재해위험지구코드/시설물코드"),
          )
          .col(integer(TcmCouDngrAlmord::CdDistObsv).comment("계측기 순번4"))
          .col(char(TcmCouDngrAlmord::Almcode).char_len(2).comment("경보코드"))
          .col(string(TcmCouDngrAlmord::Almde).string_len(14).comment("경보발령일시"))
          .col(char(TcmCouDngrAlmord::Almgb).char_len(1).comment("발령구분"))
          .col(
            string(TcmCouDngrAlmord::Almnote)
              .string_len(1000)
              .null()
              .comment("경보발령내용"),
          )
          .col(char(TcmCouDngrAlmord::Admcode).char_len(5).comment("관리기관코드"))
          .col(date_time(TcmCouDngrAlmord::Rgsde).comment("최초등록일시"))
          .col(date_time(TcmCouDngrAlmord::Updde).comment("최종수정일시"))
          .to_owned(),
      )
      .await
      .unwrap();

    // 여러개의 primary key 지정했을 때 오류가 나서, sql로 실행해줌.
    let sql = "ALTER TABLE tcm_cou_dngr_almord ADD CONSTRAINT tcm_cou_dngr_almord_pk PRIMARY KEY (DSCODE,CD_DIST_OBSV,ALMCODE,ALMDE,ALMGB)";
    let stmt = Statement::from_string(manager.get_database_backend(), sql.to_owned());
    manager.get_connection().execute(stmt).await.map(|_| ()).unwrap();

    Ok(())
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .drop_table(Table::drop().table(TcmCouDngrAlmord::Table).to_owned())
      .await
  }
}

#[derive(DeriveIden)]
enum TcmCouDngrAlmord {
  Table,
  #[sea_orm(iden = "DSCODE")]
  Dscode,
  #[sea_orm(iden = "CD_DIST_OBSV")]
  CdDistObsv,
  #[sea_orm(iden = "ALMCODE")]
  Almcode,
  #[sea_orm(iden = "ALMDE")]
  Almde,
  #[sea_orm(iden = "ALMGB")]
  Almgb,
  #[sea_orm(iden = "ALMNOTE")]
  Almnote,
  #[sea_orm(iden = "ADMCODE")]
  Admcode,
  #[sea_orm(iden = "RGSDE")]
  Rgsde,
  #[sea_orm(iden = "UPDDE")]
  Updde,
}
