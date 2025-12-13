use sea_orm_migration::{prelude::*, schema::*};

use crate::m20230423_083434_tb_grp::TbGrp;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .create_table(
        Table::create()
          .table(TbEbrd::Table)
          .comment("전광판")
          .if_not_exists()
          .col(pk_auto(TbEbrd::EbrdSeq).comment("전광판일련번호"))
          .col(string(TbEbrd::EbrdId).string_len(30).comment("전광판ID(12자리)"))
          .col(double(TbEbrd::EbrdLat).comment("위도"))
          .col(double(TbEbrd::EbrdLng).comment("경도"))
          .col(string(TbEbrd::EbrdNm).string_len(64).comment("전광판명"))
          .col(string(TbEbrd::EbrdIp).string_len(30).comment("IP"))
          .col(integer(TbEbrd::EbrdPort).comment("포트"))
          .col(integer(TbEbrd::DispSeq).null().comment("표시순서"))
          .col(string(TbEbrd::CommStat).string_len(30).null().comment("통신상태"))
          .col(string(TbEbrd::CmdRslt).string_len(30).null().comment("명령 처리 결과"))
          .col(integer(TbEbrd::CmdRsltCd).null().comment("명령 처리 결과 코드"))
          .col(string(TbEbrd::EbrdType).string_len(30).comment("전광판타입"))
          .col(integer(TbEbrd::EbrdEmerMsgPos).null().comment("긴급메시지 방번호"))
          .col(integer(TbEbrd::EbrdSizeW).comment("전광판크기(가로)"))
          .col(integer(TbEbrd::EbrdSizeH).comment("전광판크기(세로)"))
          .col(integer(TbEbrd::BrghtDayLvl).comment("주간휘도단계"))
          .col(integer(TbEbrd::BrghtNightLvl).comment("야간휘도단계"))
          .col(string(TbEbrd::EbrdDesc).string_len(1024).null().comment("설명"))
          .col(string(TbEbrd::DayTimeStart).string_len(30).comment("주간시간(시작)"))
          .col(string(TbEbrd::DayTimeEnd).string_len(30).comment("주간시간(종료)"))
          .col(string(TbEbrd::OnTimeStart).string_len(30).comment("켜는시간(시작)"))
          .col(string(TbEbrd::OnTimeEnd).string_len(30).comment("켜는시간(종료)"))
          .col(
            string(TbEbrd::SendYn)
              .string_len(1)
              .default("N")
              .comment("전광판에 필요 데이터 전송여부."),
          )
          .col(string_len_null(TbEbrd::EbrdWeatherMsg, 128).comment("날씨메시지"))
          .col(string_len_null(TbEbrd::EbrdDispMsg, 1024).comment("표출메시지"))
          .col(string_len_null(TbEbrd::EbrdEvent, 30).comment("전광판 이벤트"))
          .col(integer(TbEbrd::CamSeq).null().comment("카메라일련번호"))
          .col(string(TbEbrd::GrpId).string_len(30).default("R001").comment("그룹ID"))
          .foreign_key(
            ForeignKey::create()
              .from(TbEbrd::Table, TbEbrd::GrpId)
              .to(TbGrp::Table, TbGrp::GrpId)
              .on_delete(ForeignKeyAction::Cascade)
              .on_update(ForeignKeyAction::Cascade),
          )
          .to_owned(),
      )
      .await
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager.drop_table(Table::drop().table(TbEbrd::Table).to_owned()).await
  }
}

#[derive(DeriveIden)]
pub enum TbEbrd {
  Table,
  EbrdSeq,
  EbrdId,
  EbrdLat,
  EbrdLng,
  EbrdNm,
  EbrdIp,
  EbrdPort,
  EbrdType,
  EbrdEmerMsgPos, // 긴급메시지 일련번호.
  CommStat,       // 통신상태
  CmdRslt,
  CmdRsltCd,
  EbrdSizeW,
  EbrdSizeH,
  BrghtDayLvl,
  BrghtNightLvl,
  EbrdDesc, // 설명.
  DayTimeStart,
  DayTimeEnd,
  OnTimeStart,
  OnTimeEnd,
  SendYn, // 전광판에 필요 데이터 전송여부.
  EbrdWeatherMsg,
  EbrdDispMsg,
  EbrdEvent,
  CamSeq,
  GrpId,
  DispSeq,
}
