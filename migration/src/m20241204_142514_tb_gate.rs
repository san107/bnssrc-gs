use sea_orm_migration::{prelude::*, schema::*};

use crate::{m20230423_083434_tb_grp::TbGrp, m20241204_135847_tb_camera::TbCamera};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .create_table(
        Table::create()
          .table(TbGate::Table)
          .comment("차단기")
          .if_not_exists()
          .col(pk_auto(TbGate::GateSeq).comment("차단기일련번호"))
          .col(integer(TbGate::DispSeq).null().comment("표시순서"))
          .col(double(TbGate::GateLat).comment("위도"))
          .col(double(TbGate::GateLng).comment("경도"))
          .col(string(TbGate::GateNm).string_len(64).comment("차단기명"))
          .col(string(TbGate::GateIp).string_len(30).comment("차단기IP"))
          .col(integer(TbGate::GatePort).comment("차단기포트번호"))
          .col(string(TbGate::GateType).string_len(30).comment("차단기유형"))
          .col(string(TbGate::DownType).string_len(30).comment("차단방식(GDT)"))
          .col(string(TbGate::AutoDownCond).string_len(30).null().comment("차단조건(WS)"))
          .col(integer(TbGate::GateNo).null().comment("HP차단막의 경우, 연결차단기수"))
          .col(integer(TbGate::CamSeq).null().comment("카메라일련번호")) // 카메라 없이도 등록이 가능하도록
          .col(string(TbGate::GateStat).string_len(30).null().comment("차단기상태"))
          .col(string(TbGate::CmdRslt).string_len(30).null().comment("제어결과"))
          .col(string_len_null(TbGate::EbrdOperMode, 30).comment("전광판 운영모드"))
          .col(string_len_null(TbGate::EmcallOperMode, 30).comment("비상통화장치 운영모드"))
          .col(string(TbGate::GrpId).string_len(30).default("R001").comment("그룹ID"))
          .foreign_key(
            ForeignKey::create()
              .from(TbGate::Table, TbGate::GrpId)
              .to(TbGrp::Table, TbGrp::GrpId)
              .on_delete(ForeignKeyAction::Cascade)
              .on_update(ForeignKeyAction::Cascade),
          )
          .foreign_key(
            ForeignKey::create()
              .from(TbGate::Table, TbGate::CamSeq)
              .to(TbCamera::Table, TbCamera::CamSeq)
              .on_delete(ForeignKeyAction::SetNull)
              .on_update(ForeignKeyAction::SetNull),
          )
          .to_owned(),
      )
      .await
      .unwrap();

    // let insert = Query::insert()
    //   .into_table(TbGate::Table)
    //   .columns([
    //     TbGate::GateNm,
    //     TbGate::GateLat,
    //     TbGate::GateLng,
    //     TbGate::GateIp,
    //     TbGate::GatePort,
    //     TbGate::GateType,
    //     TbGate::GateNo,
    //     TbGate::DownType,
    //     TbGate::AutoDownCond,
    //     TbGate::CamSeq,
    //   ])
    //   .values_panic([
    //     "231 오토바 9994".into(),
    //     37.7207123.into(),
    //     127.1879128.into(),
    //     "221.140.147.154".into(),
    //     9994.into(),
    //     "Autogate".into(),
    //     Value::Int(None).into(),
    //     "Auto".into(),
    //     "Alert".into(),
    //     5.into(),
    //   ])
    //   .values_panic([
    //     "233 오토바 9992".into(),
    //     37.7164774.into(),
    //     127.1846513.into(),
    //     "221.140.147.154".into(),
    //     9992.into(),
    //     "Autogate".into(),
    //     Value::Int(None).into(),
    //     "Auto".into(),
    //     "Crit".into(),
    //     4.into(),
    //   ])
    //   .values_panic([
    //     "68 이츠온문 9993".into(),
    //     37.7200853.into(),
    //     127.1875266.into(),
    //     "221.140.147.154".into(),
    //     9993.into(),
    //     "Itson".into(),
    //     Value::Int(None).into(),
    //     "Man".into(),
    //     Value::String(None).into(),
    //     3.into(),
    //   ])
    //   .values_panic([
    //     "회234 이츠온문 9991".into(),
    //     37.7176793.into(),
    //     127.1895007.into(),
    //     "221.140.147.154".into(),
    //     9991.into(),
    //     "Itson".into(),
    //     Value::Int(None).into(),
    //     "Auto".into(),
    //     "Alert".into(),
    //     11.into(),
    //   ])
    //   .values_panic([
    //     "HP시스템(차단막)".into(),
    //     37.7159486.into(),
    //     127.1867863.into(),
    //     "192.168.0.161".into(),
    //     502.into(),
    //     "Hpsys".into(),
    //     SimpleExpr::Value(Value::Int(Some(1i32))),
    //     "Auto".into(),
    //     "Crit".into(),
    //     4.into(),
    //   ])
    //   .values_panic([
    //     "HP시스템(차단막)-2".into(),
    //     37.7159486.into(),
    //     127.1867863.into(),
    //     "192.168.0.161".into(),
    //     502.into(),
    //     "Hpsys".into(),
    //     SimpleExpr::Value(Value::Int(Some(2i32))),
    //     "Auto".into(),
    //     "Alert".into(),
    //     4.into(),
    //   ])
    //   .values_panic([
    //     "회236 이츠온바 9989".into(),
    //     37.7231796.into(),
    //     127.1917645.into(),
    //     "221.140.147.154".into(),
    //     9989.into(),
    //     "Itson".into(),
    //     Value::Int(None).into(),
    //     "Man".into(),
    //     Value::String(None).into(),
    //     6.into(),
    //   ])
    //   .to_owned();

    // manager.exec_stmt(insert).await?;

    Ok(())
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager.drop_table(Table::drop().table(TbGate::Table).to_owned()).await
  }
}

#[derive(DeriveIden)]
pub enum TbGate {
  Table,
  GateSeq,
  DispSeq,
  GateLat,
  GateLng,
  GateNm,
  GateIp,
  GatePort,
  GateType,
  DownType,
  AutoDownCond,
  GateNo, // 게이트 수. == > HP차단막 타입의 경우만 입력, 개수가 보통하나이나, 여러개 올 수 있음.
  CamSeq,
  GateStat,
  CmdRslt,
  EbrdOperMode,   // 전광판 운영모드
  EmcallOperMode, // 비상통화장치 운영모드
  GrpId,
}
