use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .create_table(
        Table::create()
          .table(TbSysConf::Table)
          .if_not_exists()
          .col(
            string(TbSysConf::SysConfId)
              .string_len(30)
              .primary_key()
              .comment("SYS 환경설정 ID"),
          )
          .col(integer(TbSysConf::LoginLogoFileSeq).null().comment("로그인 로고 파일 시퀀스"))
          .col(integer(TbSysConf::LogoFileSeq).null().comment("로고 파일 시퀀스"))
          .col(string_len_null(TbSysConf::ApiKeyWeather, 256).comment("기상청 API Key"))
          .col(string_len_null(TbSysConf::ApiKeyMap, 256).comment("VWorld API Key"))
          .col(string_len_null(TbSysConf::UrlOfflineMap, 256).comment("오프라인 지도 URL"))
          .col(string_len_null(TbSysConf::UseOfflineMapYn, 1).comment("오프라인 지도 사용 여부"))
          .col(string_len_null(TbSysConf::UseWaterYn, 1).comment("수위계 기능 사용 여부"))
          .col(string_len_null(TbSysConf::UseEbrdYn, 1).comment("전광판 기능 사용 여부"))
          .col(string_len_null(TbSysConf::UseEmcallYn, 1).comment("비상벨 기능 사용 여부"))
          .col(string_len_null(TbSysConf::UseEmcallGrpYn, 1).comment("송출그룹 기능 사용 여부"))
          .col(string_len_null(TbSysConf::UseGateYn, 1).comment("차단기 기능 사용 여부"))
          .col(string_len_null(TbSysConf::UseCameraYn, 1).comment("카메라 기능 사용 여부"))
          .col(string_len_null(TbSysConf::UseWeatherYn, 1).comment("날씨 기능 사용 여부"))
          .col(string_len_null(TbSysConf::UseNdmsYn, 1).comment("NDMS 기능 사용 여부"))
          .col(string_len_null(TbSysConf::UseSmsYn, 1).comment("SMS 기능 사용 여부"))
          .col(string_len_null(TbSysConf::UseRtspSvrYn, 1).comment("RTSP 서버 사용 여부"))
          .col(string_len_null(TbSysConf::RtspSvrIpPort, 64).comment("RTSP 서버 IP:PORT"))
          .to_owned(),
      )
      .await
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager.drop_table(Table::drop().table(TbSysConf::Table).to_owned()).await
  }
}

#[derive(DeriveIden)]
pub enum TbSysConf {
  Table,
  SysConfId, // SYS 고정
  LoginLogoFileSeq,
  LogoFileSeq,
  ApiKeyMap,
  ApiKeyWeather,
  UrlOfflineMap,
  UseOfflineMapYn, // 오프라인 지도 사용 여부
  UseWaterYn,      // 수위 데이터 사용 여부
  UseEbrdYn,       // EBRD 데이터 사용 여부
  UseEmcallYn,     // EMCall 데이터 사용 여부
  UseEmcallGrpYn,  // EMCall 송출그룹 사용 여부
  UseGateYn,       // Gate 데이터 사용 여부
  UseCameraYn,     // Camera 데이터 사용 여부
  UseWeatherYn,    // 기상청 데이터 사용 여부
  UseNdmsYn,       // NDMS 기능 사용 여부
  UseSmsYn,        // SMS 기능 사용 여부
  UseRtspSvrYn,    // RTSP 서버 사용 여부
  RtspSvrIpPort,   // RTSP 서버 IP:PORT
}
