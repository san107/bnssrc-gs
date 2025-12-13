use sea_orm_migration::{prelude::*, schema::*, sea_orm::Statement};

use crate::{m20230423_083434_tb_grp::TbGrp, m20241204_135847_tb_camera::TbCamera};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .create_table(
        Table::create()
          .table(TbEmcallGrp::Table)
          .comment("비상통화장치 송출그룹 테이블")
          .if_not_exists()
          .col(pk_auto(TbEmcallGrp::EmcallGrpSeq).comment("비상통화장치 그룹일련번호"))
          .col(
            string(TbEmcallGrp::EmcallGrpId)
              .string_len(30)
              .comment("비상통화장치 그룹 ID"),
          )
          .col(string(TbEmcallGrp::EmcallGrpNm).string_len(64).comment("비상통화장치 그룹명"))
          .col(
            string(TbEmcallGrp::EmcallGrpIp)
              .string_len(30)
              .comment("비상통화장치 그룹 IP"),
          )
          .col(integer(TbEmcallGrp::EmcallGrpPort).comment("비상통화장치 그룹 PORT"))
          .col(double_null(TbEmcallGrp::EmcallGrpLng).comment("비상통화장치 그룹 경도"))
          .col(double_null(TbEmcallGrp::EmcallGrpLat).comment("비상통화장치 그룹 위도"))
          .col(string(TbEmcallGrp::EmcallType).string_len(30).comment("비상통화장치 타입"))
          .col(string(TbEmcallGrp::CommStat).string_len(30).null().comment("통신상태"))
          .col(integer(TbEmcallGrp::CamSeq).null().comment("카메라"))
          .foreign_key(
            ForeignKey::create()
              .from(TbEmcallGrp::Table, TbEmcallGrp::CamSeq)
              .to(TbCamera::Table, TbCamera::CamSeq)
              .on_delete(ForeignKeyAction::Cascade)
              .on_update(ForeignKeyAction::Cascade),
          )
          .col(
            string(TbEmcallGrp::EmcallTtsMsg)
              .string_len(512)
              .null()
              .comment("비상시TTS메시지"),
          )
          .col(string(TbEmcallGrp::GrpId).string_len(30).comment("그룹 ID"))
          .col(
            string(TbEmcallGrp::EmcallGrpStatJson)
              .string_len(1024)
              .null()
              .comment("비상통화장치 그룹 상태"),
          )
          .foreign_key(
            ForeignKey::create()
              .from(TbEmcallGrp::Table, TbEmcallGrp::GrpId)
              .to(TbGrp::Table, TbGrp::GrpId)
              .on_delete(ForeignKeyAction::Cascade)
              .on_update(ForeignKeyAction::Cascade),
          )
          .col(integer(TbEmcallGrp::DispSeq).null().comment("표시순서"))
          .to_owned(),
      )
      .await?;

    let sql = "CREATE UNIQUE INDEX tb_emcall_grp_idx ON tb_emcall_grp (emcall_grp_id)";
    let stmt = Statement::from_string(manager.get_database_backend(), sql.to_owned());
    manager.get_connection().execute(stmt).await?;

    Ok(())
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager.drop_table(Table::drop().table(TbEmcallGrp::Table).to_owned()).await
  }
}

#[derive(DeriveIden)]
pub enum TbEmcallGrp {
  Table,
  EmcallGrpSeq,
  EmcallGrpId,
  EmcallGrpNm,
  EmcallGrpIp,
  EmcallGrpPort,
  EmcallGrpLng,
  EmcallGrpLat,
  EmcallType,
  CommStat,
  EmcallTtsMsg,
  GrpId,
  EmcallGrpStatJson,
  DispSeq,
  CamSeq,
}
