use sea_orm_migration::{prelude::*, schema::*};

use crate::m20241231_074134_tb_file::TbFile;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .create_table(
        Table::create()
          .table(TbEbrdMsg::Table)
          .comment("전광판 메시지")
          .if_not_exists()
          .col(pk_auto(TbEbrdMsg::EbrdMsgSeq).comment("전광판 메시지 일련번호"))
          .col(integer(TbEbrdMsg::EbrdSizeW).comment("전광판 메시지 너비"))
          .col(integer(TbEbrdMsg::EbrdSizeH).comment("전광판 메시지 높이"))
          .col(
            string(TbEbrdMsg::EbrdMsgText)
              .string_len(1024)
              .comment("전광판 메시지 텍스트"),
          )
          .col(string(TbEbrdMsg::EbrdMsgHtml).string_len(1024).comment("전광판 메시지 HTML"))
          .col(string(TbEbrdMsg::EbrdMsgType).string_len(30).comment("전광판 메시지 타입"))
          .col(string(TbEbrdMsg::EmergYn).string_len(1).comment("긴급여부"))
          .col(string(TbEbrdMsg::SoundYn).string_len(1).comment("소리남여부"))
          .col(integer(TbEbrdMsg::FileSeq).comment("파일일련번호"))
          .col(string(TbEbrdMsg::StartDt).string_len(30).comment("시작일시"))
          .col(string(TbEbrdMsg::EndDt).string_len(30).comment("종료일시"))
          .col(integer(TbEbrdMsg::StartEfct).comment("시작효과"))
          .col(integer(TbEbrdMsg::EndEfct).comment("종료효과"))
          .col(integer(TbEbrdMsg::StartSpd).comment("시작속도"))
          .col(integer(TbEbrdMsg::EndSpd).comment("종료속도"))
          .col(integer(TbEbrdMsg::StartWaitTime).comment("표출대기"))
          .col(integer(TbEbrdMsg::RepeatCnt).comment("반복횟수"))
          .col(string(TbEbrdMsg::UpdateUserId).string_len(32).comment("수정자"))
          .col(date_time(TbEbrdMsg::UpdateDt).comment("수정일자"))
          .foreign_key(
            ForeignKey::create()
              .from(TbEbrdMsg::Table, TbEbrdMsg::FileSeq)
              .to(TbFile::Table, TbFile::FileSeq)
              .on_delete(ForeignKeyAction::Cascade)
              .on_update(ForeignKeyAction::Cascade),
          )
          .to_owned(),
      )
      .await
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager.drop_table(Table::drop().table(TbEbrdMsg::Table).to_owned()).await
  }
}

#[derive(DeriveIden)]
pub enum TbEbrdMsg {
  Table,
  EbrdMsgSeq,
  EbrdSizeW,
  EbrdSizeH,
  EbrdMsgText,   // 태그를 제거한 텍스트 만.
  EbrdMsgHtml,   // 이미지 생성을 위한 HTML
  EbrdMsgType,   // 이미지, 동영상, 텍스트.
  EmergYn,       // 긴급여부
  SoundYn,       // 소리남여부
  FileSeq,       // 파일일련번호(파일 테이블에 참조 카운트 추가할 것)
  StartDt,       // 시작일시 : 년월일 시분
  EndDt,         // 종료일시 : 년월일 시분
  StartEfct,     // 시작효과
  EndEfct,       // 종료효과
  StartSpd,      // 시작속도
  EndSpd,        // 종료속도
  StartWaitTime, // 표출대기
  RepeatCnt,     // 반복횟수
  UpdateUserId,  // 작성자
  UpdateDt,      // 작성일자
}
