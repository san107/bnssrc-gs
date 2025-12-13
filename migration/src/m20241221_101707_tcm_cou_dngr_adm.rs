use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .create_table(
        Table::create()
          .table(TcmCouDngrAdm::Table)
          .comment("센싱정보 관리기관 정보")
          .if_not_exists()
          .col(char(TcmCouDngrAdm::Admcode).char_len(5).primary_key().comment("관리기관코드"))
          .col(string(TcmCouDngrAdm::Chpsnnm).string_len(100).comment("담당자명"))
          .col(string(TcmCouDngrAdm::ChargeDept).string_len(100).comment("담당부서"))
          .col(string(TcmCouDngrAdm::Cttpc).string_len(20).comment("연락처"))
          .col(string(TcmCouDngrAdm::Rm).string_len(1000).null().comment("비고"))
          .col(char(TcmCouDngrAdm::UseYn).char_len(1).comment("사용여부"))
          .col(date_time(TcmCouDngrAdm::Rgsde).comment("최초등록일시"))
          .col(date_time(TcmCouDngrAdm::Updde).comment("최종수정일시"))
          .to_owned(),
      )
      .await
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager.drop_table(Table::drop().table(TcmCouDngrAdm::Table).to_owned()).await
  }
}

#[derive(DeriveIden)]
enum TcmCouDngrAdm {
  Table,
  #[sea_orm(iden = "ADMCODE")]
  Admcode,
  #[sea_orm(iden = "CHPSNNM")]
  Chpsnnm,
  #[sea_orm(iden = "CHARGE_DEPT")]
  ChargeDept,
  #[sea_orm(iden = "CTTPC")]
  Cttpc,
  #[sea_orm(iden = "RM")]
  Rm,
  #[sea_orm(iden = "USE_YN")]
  UseYn,
  #[sea_orm(iden = "RGSDE")]
  Rgsde,
  #[sea_orm(iden = "UPDDE")]
  Updde,
}
