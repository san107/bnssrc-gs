use migration::m20250503_033054_tb_sys_conf::TbSysConf;
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    let db = manager.get_connection();
    db.execute_unprepared("delete from tb_sys_conf").await?; // 우선 삭제하고 나서.

    let insert = Query::insert()
      .into_table(TbSysConf::Table)
      .columns([
        TbSysConf::SysConfId,
        TbSysConf::ApiKeyMap,
        TbSysConf::ApiKeyWeather,
        TbSysConf::UrlOfflineMap,
        TbSysConf::UseOfflineMapYn, // 오프라인 지도 사용 여부
        TbSysConf::UseWaterYn,      // 수위 데이터 사용 여부
        TbSysConf::UseEbrdYn,       // EBRD 데이터 사용 여부
        TbSysConf::UseEmcallYn,     // EMCall 데이터 사용 여부
        TbSysConf::UseGateYn,       // Gate 데이터 사용 여부
        TbSysConf::UseCameraYn,     // Camera 데이터 사용 여부
        TbSysConf::UseWeatherYn,    // 기상청 데이터 사용 여부
        TbSysConf::UseNdmsYn,       // NDMS 기능 사용 여부
        TbSysConf::UseSmsYn,        // SMS 기능 사용 여부
        TbSysConf::UseRtspSvrYn,    // RTSP 서버 사용 여부
        TbSysConf::RtspSvrIpPort,   // RTSP 서버 IP:PORT
      ])
      .values_panic(
        [
          "SYS",
          "CFEAB327-B762-37FD-B683-FEFE8ABD4D02",
          "H0Culebpca%2BTtxzM8mTp7YD%2FxBMECqxylxyH9TODGrVAFqdPkhMb7RFnY48%2BbzRIxIlZcKtkIa8FwsFxCGkYYQ%3D%3D",
          "http://localhost:3013",
          "N",
          "Y",
          "Y",
          "Y",
          "Y",
          "Y",
          "Y",
          "Y",
          "Y",
          "N", // RTSP 서버 사용 여부 기본 사용하지 않음.
          "127.0.0.1:3012",
        ]
        .map(|ele| ele.into()),
      )
      .to_owned();

    manager.exec_stmt(insert).await?;
    Ok(())
  }

  async fn down(&self, _manager: &SchemaManager) -> Result<(), DbErr> {
    Ok(())
  }
}
