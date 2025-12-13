use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .create_table(
        Table::create()
          .table(TcmFludBoard::Table)
          .comment("전광판정보")
          .if_not_exists()
          .col(string_len(TcmFludBoard::Flcode, 10).comment("침수지점코드"))
          .col(integer(TcmFludBoard::CdDistBoard).comment("전광판순번"))
          .primary_key(Index::create().col(TcmFludBoard::Flcode).col(TcmFludBoard::CdDistBoard))
          .col(string_len(TcmFludBoard::NmDistBoard, 100).comment("전광판명칭"))
          .col(string_len_null(TcmFludBoard::CommSttus, 1).comment("통신상태"))
          .col(string_len_null(TcmFludBoard::MsgBoard, 512).comment("표출메시지"))
          .col(double_null(TcmFludBoard::Lat).comment("위도10,7"))
          .col(double_null(TcmFludBoard::Lon).comment("경도10,7"))
          .col(string_len_null(TcmFludBoard::Rm, 1000).comment("비고"))
          .col(string_len(TcmFludBoard::UseYn, 1).comment("사용여부"))
          .col(date_time(TcmFludBoard::Rgsde).comment("최초등록일시"))
          .col(date_time(TcmFludBoard::Updde).comment("최종수정일시"))
          .to_owned(),
      )
      .await
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager.drop_table(Table::drop().table(TcmFludBoard::Table).to_owned()).await
  }
}

#[derive(DeriveIden)]
pub enum TcmFludBoard {
  Table,
  #[sea_orm(iden = "FLCODE")]
  Flcode,
  #[sea_orm(iden = "CD_DIST_BOARD")]
  CdDistBoard,
  #[sea_orm(iden = "NM_DIST_BOARD")]
  NmDistBoard,
  #[sea_orm(iden = "COMM_STTUS")]
  CommSttus,
  #[sea_orm(iden = "MSG_BOARD")]
  MsgBoard,
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
