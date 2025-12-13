use migration::m20241204_105750_tb_cd::TbCd;
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    let db = manager.get_connection();
    db.execute_unprepared("delete from tb_cd").await?; // 우선 삭제하고 나서.

    enum SN<'a> {
      S(&'a str),
      SEQ(),
    }
    use SN::*;
    let list = [
      // 그룹
      [S("00.GT"), S("00"), S("GT"), S("차단기 타입"), SEQ()],
      [S("00.WT"), S("00"), S("WT"), S("수위계 타입"), SEQ()],
      [S("00.GS"), S("00"), S("GS"), S("차단기 상태"), SEQ()],
      [S("00.GR"), S("00"), S("GR"), S("차단기 제어 결과"), SEQ()],
      [S("00.CT"), S("00"), S("CT"), S("카메라 타입"), SEQ()],
      [S("00.CS"), S("00"), S("CS"), S("통신 상태"), SEQ()],
      [S("00.CR"), S("00"), S("CR"), S("명령 처리 결과"), SEQ()],
      [S("00.UR"), S("00"), S("UR"), S("사용자 유형"), SEQ()],
      [S("00.WS"), S("00"), S("WS"), S("수위계 상태"), SEQ()],
      [S("00.WMOD"), S("00"), S("WMOD"), S("수위계 동작모드"), SEQ()],
      [S("00.GDT"), S("00"), S("GDT"), S("게이트 차단 방식"), SEQ()],
      [S("00.NCD"), S("00"), S("NCD"), S("INT형코드(TB_NCD)"), SEQ()],
      [S("00.EbrdType"), S("00"), S("EbrdType"), S("전광판 타입"), SEQ()],
      [S("00.EmcallType"), S("00"), S("EmcallType"), S("비상통화장치 타입"), SEQ()],
      [S("00.EmcallEvt"), S("00"), S("EmcallEvt"), S("비상통화장치 이벤트"), SEQ()],
      [S("00.EbrdMsgType"), S("00"), S("EbrdMsgType"), S("전광판 메시지 타입"), SEQ()],
      [S("00.EbrdOperMode"), S("00"), S("EbrdOperMode"), S("전광판 운영모드"), SEQ()],
      [
        S("00.EmcallOperMode"),
        S("00"),
        S("EmcallOperMode"),
        S("비상통화장치 운영모드"),
        SEQ(),
      ],
      // 전광판 운영모드.
      [S("EbrdOperMode.None"), S("EbrdOperMode"), S("None"), S("연동 안함"), SEQ()],
      [
        S("EbrdOperMode.AutoDown"),
        S("EbrdOperMode"),
        S("AutoDown"),
        S("자동 차단시"),
        SEQ(),
      ],
      [S("EbrdOperMode.Down"), S("EbrdOperMode"), S("Down"), S("차단시"), SEQ()],
      // 비상통화장치 운영모드.
      [
        S("EmcallOperMode.None"),
        S("EmcallOperMode"),
        S("None"),
        S("연동 안함"),
        SEQ(),
      ],
      [
        S("EmcallOperMode.AutoDown"),
        S("EmcallOperMode"),
        S("AutoDown"),
        S("자동 차단시"),
        SEQ(),
      ],
      [S("EmcallOperMode.Down"), S("EmcallOperMode"), S("Down"), S("차단시"), SEQ()],
      // 수위계 동작모드
      [S("WMOD.Def"), S("WMOD"), S("Def"), S("기본모드"), SEQ()],
      [S("WMOD.Grp"), S("WMOD"), S("Grp"), S("그룹모드"), SEQ()],
      // 전광판 메시지 타입.
      [S("EbrdMsgType.Text"), S("EbrdMsgType"), S("Text"), S("텍스트"), SEQ()],
      [S("EbrdMsgType.Image"), S("EbrdMsgType"), S("Image"), S("이미지"), SEQ()],
      [S("EbrdMsgType.Video"), S("EbrdMsgType"), S("Video"), S("동영상"), SEQ()],
      // INT형코드(TB_NCD 테이블의 NCD_GRP를 확인해야함)
      [S("NCD.EndSpd"), S("NCD"), S("EndSpd"), S("전광판 종료속도"), SEQ()],
      [S("NCD.EndEfct"), S("NCD"), S("EndEfct"), S("전광판 종료효과"), SEQ()],
      [S("NCD.StartSpd"), S("NCD"), S("StartSpd"), S("전광판 표출속도"), SEQ()],
      [S("NCD.StartEfct"), S("NCD"), S("StartEfct"), S("전광판 표출효과"), SEQ()],
      [S("NCD.EbrdErr"), S("NCD"), S("EbrdErr"), S("전광판 에러코드"), SEQ()],
      // 비상통화장치 이벤트
      [S("EmcallEvt.B_PUSH"), S("EmcallEvt"), S("B_PUSH"), S("비상벨 버튼"), SEQ()],
      [
        S("EmcallEvt.B_START"),
        S("EmcallEvt"),
        S("B_START"),
        S("비상통화 시작"),
        SEQ(),
      ],
      [S("EmcallEvt.B_STOP"), S("EmcallEvt"), S("B_STOP"), S("비상통화 중지"), SEQ()],
      [S("EmcallEvt.S1_ON"), S("EmcallEvt"), S("S1_ON"), S("수위계 켜짐"), SEQ()],
      [S("EmcallEvt.S1_OFF"), S("EmcallEvt"), S("S1_OFF"), S("수위계 꺼짐"), SEQ()],
      [S("EmcallEvt.B_ALIVE"), S("EmcallEvt"), S("B_ALIVE"), S("Alive 메시지"), SEQ()],
      // 전광판타입.
      [S("EbrdType.Noaled"), S("EbrdType"), S("Noaled"), S("노아LED"), SEQ()],
      // 비상통화장치 타입.
      [S("EmcallType.Itg"), S("EmcallType"), S("Itg"), S("ITG"), SEQ()],
      // 차단기 타입
      [S("GT.Autogate"), S("GT"), S("Autogate"), S("오토게이트"), SEQ()], // 01
      [S("GT.Itson"), S("GT"), S("Itson"), S("이츠온"), SEQ()],
      [S("GT.Hpsys"), S("GT"), S("Hpsys"), S("HP 차단막"), SEQ()],
      [S("GT.HpsysCrtn"), S("GT"), S("HpsysCrtn"), S("HP 커튼"), SEQ()],
      [S("GT.Doori"), S("GT"), S("Doori"), S("두리시스템"), SEQ()],
      [S("GT.Hngsk"), S("GT"), S("Hngsk"), S("측주형"), SEQ()],
      [S("GT.Fptech"), S("GT"), S("Fptech"), S("에프피텍"), SEQ()],
      [S("GT.Sysbase"), S("GT"), S("Sysbase"), S("시스템베이스"), SEQ()],
      [S("GT.Realsys"), S("GT"), S("Realsys"), S("리얼시스"), SEQ()],
      [S("GT.Yesung"), S("GT"), S("Yesung"), S("예성 차단막"), SEQ()],
      // 수위계 타입.
      [S("WT.Istec"), S("WT"), S("Istec"), S("IS Technology"), SEQ()],
      [S("WT.ItgOnoff"), S("WT"), S("ItgOnoff"), S("ITG 접점식"), SEQ()],
      [S("WT.HpOnoff"), S("WT"), S("HpOnoff"), S("HP 접점식"), SEQ()],
      [S("WT.HpAnalog"), S("WT"), S("HpAnalog"), S("HP 초음파"), SEQ()],
      // 차단기 상태.
      [S("GS.UpOk"), S("GS"), S("UpOk"), S("열림"), SEQ()],
      [S("GS.UpLock"), S("GS"), S("UpLock"), S("열림"), SEQ()],
      [S("GS.UpAction"), S("GS"), S("UpAction"), S("여는중"), SEQ()],
      [S("GS.DownOk"), S("GS"), S("DownOk"), S("닫힘"), SEQ()],
      [S("GS.DownAction"), S("GS"), S("DownAction"), S("닫는중"), SEQ()],
      [S("GS.DownLock"), S("GS"), S("DownLock"), S("닫힘"), SEQ()],
      [S("GS.Moving"), S("GS"), S("Moving"), S("동작중"), SEQ()],
      [S("GS.Na"), S("GS"), S("Na"), S("N/A"), SEQ()],
      [S("GS.Fault"), S("GS"), S("Fault"), S("에러"), SEQ()],
      [S("GS.Stop"), S("GS"), S("Stop"), S("정지"), SEQ()],
      // 차단기 차단방식.(Gate Down Type)
      [S("GDT.Auto"), S("GDT"), S("Auto"), S("자동차단"), SEQ()],
      [S("GDT.Man"), S("GDT"), S("Man"), S("수동차단"), SEQ()],
      // 차단기 제어 결과.
      [S("GR.Success"), S("GR"), S("Success"), S("성공"), SEQ()],
      [S("GR.Fail"), S("GR"), S("Fail"), S("실패"), SEQ()],
      [S("GR.ModeErr"), S("GR"), S("ModeErr"), S("모드오류"), SEQ()], // 원격제어 안되는 조건인 경우.
      // 카메라 타입.
      [S("CT.Bns"), S("CT"), S("Bns"), S("비엔에스테크"), SEQ()],
      [S("CT.Idis"), S("CT"), S("Idis"), S("아이디스"), SEQ()],
      [S("CT.Truen"), S("CT"), S("Truen"), S("트루엔"), SEQ()],
      [S("CT.Hanwha"), S("CT"), S("Hanwha"), S("한화"), SEQ()],
      [S("CT.Hngsk"), S("CT"), S("Hngsk"), S("홍석"), SEQ()],
      [S("CT.Seo"), S("CT"), S("Seo"), S("세오"), SEQ()],
      // 사용자 유형.
      [S("UR.Inst"), S("UR"), S("Inst"), S("설치자"), SEQ()],
      [S("UR.Admin"), S("UR"), S("Admin"), S("관리자"), SEQ()],
      [S("UR.User"), S("UR"), S("User"), S("사용자"), SEQ()],
      // 수위계 상태.
      [S("WS.Unknown"), S("WS"), S("Unknown"), S("N/A"), SEQ()],
      [S("WS.Norm"), S("WS"), S("Norm"), S("안전"), SEQ()],
      [S("WS.Attn"), S("WS"), S("Attn"), S("관심"), SEQ()],
      [S("WS.Warn"), S("WS"), S("Warn"), S("주의"), SEQ()],
      [S("WS.Alert"), S("WS"), S("Alert"), S("경계"), SEQ()],
      [S("WS.Crit"), S("WS"), S("Crit"), S("심각"), SEQ()],
      // 통신상태.
      [S("CS.Ok"), S("CS"), S("Ok"), S("정상"), SEQ()],
      [S("CS.Err"), S("CS"), S("Err"), S("오류"), SEQ()],
      // 명령 처리 결과.
      [S("CR.Success"), S("CR"), S("Success"), S("성공"), SEQ()],
      [S("CR.Fail"), S("CR"), S("Fail"), S("실패"), SEQ()],
    ];
    let mut insert = Query::insert()
      .into_table(TbCd::Table)
      .columns([TbCd::Cd, TbCd::CdGrp, TbCd::CdId, TbCd::CdNm, TbCd::CdSeq])
      .to_owned();

    for (idx, ele) in list.iter().enumerate() {
      insert = insert
        .values_panic(ele.iter().map(|ele| match ele {
          SN::S(s) => (*s).into(),
          SN::SEQ() => ((idx + 1) as i32).into(),
        }))
        .to_owned();
    }

    manager.exec_stmt(insert).await?;

    Ok(())
  }

  async fn down(&self, _manager: &SchemaManager) -> Result<(), DbErr> {
    // Replace the sample below with your own migration scripts

    //manager.drop_table(Table::drop().table(Post::Table).to_owned()).await
    Ok(())
  }
}
