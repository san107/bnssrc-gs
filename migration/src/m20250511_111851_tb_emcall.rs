use sea_orm_migration::{prelude::*, schema::*, sea_orm::Statement};

use crate::{m20230423_083434_tb_grp::TbGrp, m20250511_111759_tb_emcall_grp::TbEmcallGrp};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .create_table(
        Table::create()
          .table(TbEmcall::Table)
          .comment("비상통화장치")
          .if_not_exists()
          .col(pk_auto(TbEmcall::EmcallSeq).comment("비상통화장치 일련번호"))
          .col(string(TbEmcall::EmcallId).string_len(30).comment("비상통화장치ID"))
          .col(string(TbEmcall::EmcallNm).string_len(64).comment("비상통화장치명"))
          .col(double(TbEmcall::EmcallLng).comment("비상통화장치 경도"))
          .col(double(TbEmcall::EmcallLat).comment("비상통화장치 위도"))
          // .col(string(TbEmcall::EmcallIp).string_len(30).comment("비상통화장치 IP"))
          // .col(integer(TbEmcall::EmcallPort).comment("비상통화장치 PORT"))
          .col(integer(TbEmcall::CamSeq).null().comment("비상통화장치 카메라"))
          .col(string(TbEmcall::EmcallType).string_len(30).comment("비상통화장치 타입"))
          .col(string(TbEmcall::CommStat).string_len(30).null().comment("통신상태"))
          .col(integer(TbEmcall::DispSeq).null().comment("표시순서"))
          .col(integer(TbEmcall::EmcallGrpSeq).comment("비상통화장치 그룹일련번호"))
          .foreign_key(
            ForeignKey::create()
              .from(TbEmcall::Table, TbEmcall::EmcallGrpSeq)
              .to(TbEmcallGrp::Table, TbEmcallGrp::EmcallGrpSeq)
              .on_delete(ForeignKeyAction::Cascade)
              .on_update(ForeignKeyAction::Cascade),
          )
          .col(string(TbEmcall::GrpId).string_len(30).default("R001").comment("그룹ID"))
          .foreign_key(
            ForeignKey::create()
              .from(TbEmcall::Table, TbEmcall::GrpId)
              .to(TbGrp::Table, TbGrp::GrpId)
              .on_delete(ForeignKeyAction::Cascade)
              .on_update(ForeignKeyAction::Cascade),
          )
          .to_owned(),
      )
      .await?;

    let sql = "CREATE UNIQUE INDEX tb_emcall_emcall_id_idx ON tb_emcall (emcall_id)";
    let stmt = Statement::from_string(manager.get_database_backend(), sql.to_owned());
    manager.get_connection().execute(stmt).await?;

    Ok(())
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager.drop_table(Table::drop().table(TbEmcall::Table).to_owned()).await
  }
}

#[derive(DeriveIden)]
pub enum TbEmcall {
  Table,
  EmcallSeq,
  EmcallId,
  EmcallNm,
  EmcallLng,
  EmcallLat,
  // EmcallIp,
  // EmcallPort,
  EmcallType,
  CommStat, // 통신상태
  GrpId,
  DispSeq,
  CamSeq,
  EmcallGrpSeq,
}
