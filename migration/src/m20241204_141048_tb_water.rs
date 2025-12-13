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
          .table(TbWater::Table)
          .if_not_exists()
          .col(pk_auto(TbWater::WaterSeq).comment("수위계일련번호"))
          .col(integer(TbWater::DispSeq).null().comment("표시순서"))
          .col(string(TbWater::WaterDevId).string_len(30).comment("수위계장치ID"))
          .col(integer(TbWater::WaterGateSeq).null().comment("수위계데이터-차단기일련번호"))
          .col(string(TbWater::WaterNm).string_len(64).comment("수위계명"))
          .col(double(TbWater::WaterLat).comment("위도"))
          .col(double(TbWater::WaterLng).comment("경도"))
          .col(
            string(TbWater::WaterMod)
              .string_len(30)
              .default("Def")
              .comment("수위계동작모드"),
          )
          .col(integer(TbWater::CamSeq).null().comment("수위계카메라"))
          .col(double(TbWater::LimitAttn).comment("관심수위(m)"))
          .col(double(TbWater::LimitWarn).comment("주의수위(m)"))
          .col(double(TbWater::LimitAlert).comment("경계수위(m)"))
          .col(double(TbWater::LimitCrit).comment("심각수위(m)"))
          .col(string(TbWater::WaterType).string_len(30).comment("수위계타입WT"))
          .col(date_time(TbWater::WaterDt).null().comment("수위측정일시"))
          .col(double(TbWater::WaterLevel).null().comment("수위(m)"))
          .col(string(TbWater::WaterStat).string_len(30).null().comment("수위상태WS"))
          .col(string(TbWater::CommStat).string_len(30).null().comment("통신상태"))
          .col(string(TbWater::GrpId).string_len(30).default("R001").comment("그룹ID"))
          .foreign_key(
            ForeignKey::create()
              .from(TbWater::Table, TbWater::GrpId)
              .to(TbGrp::Table, TbGrp::GrpId)
              .on_delete(ForeignKeyAction::Cascade)
              .on_update(ForeignKeyAction::Cascade),
          )
          .foreign_key(
            ForeignKey::create()
              .from(TbWater::Table, TbWater::CamSeq)
              .to(TbCamera::Table, TbCamera::CamSeq)
              .on_delete(ForeignKeyAction::SetNull)
              .on_update(ForeignKeyAction::SetNull),
          )
          .to_owned(),
      )
      .await
      .unwrap();

    manager
      .create_index(
        Index::create()
          .name("idx_water_01")
          .table(TbWater::Table)
          .col(TbWater::WaterDevId)
          .unique()
          .to_owned(),
      )
      .await?;

    // let insert = Query::insert()
    //   .into_table(TbWater::Table)
    //   .columns([
    //     TbWater::WaterDevId,
    //     TbWater::WaterNm,
    //     TbWater::WaterLat,
    //     TbWater::WaterLng,
    //     TbWater::LimitAttn,
    //     TbWater::LimitWarn,
    //     TbWater::LimitAlert,
    //     TbWater::LimitCrit,
    //     TbWater::WaterType,
    //   ])
    //   .values_panic([
    //     "DEV001".into(),
    //     "왕숙천 위쪽".into(),
    //     37.7239625.into(),
    //     127.1945218.into(),
    //     0.2.into(),
    //     0.5.into(),
    //     0.9.into(),
    //     1.2.into(),
    //     "Istec".into(),
    //   ])
    //   .values_panic([
    //     "DEV002".into(),
    //     "금곡천".into(),
    //     37.7227409.into(),
    //     127.1950557.into(),
    //     0.3.into(),
    //     0.5.into(),
    //     0.9.into(),
    //     1.3.into(),
    //     "Istec".into(),
    //   ])
    //   .values_panic([
    //     "DEV003".into(),
    //     "왕숙천".into(),
    //     37.7223904.into(),
    //     127.1920757.into(),
    //     0.3.into(),
    //     0.7.into(),
    //     1.0.into(),
    //     1.2.into(),
    //     "Istec".into(),
    //   ])
    //   .values_panic([
    //     "0000000001".into(),
    //     "테스트수위계".into(),
    //     37.7222037.into(),
    //     127.1907453.into(),
    //     0.3.into(),
    //     1.7.into(),
    //     2.0.into(),
    //     3.2.into(),
    //     "Istec".into(),
    //   ])
    //   .to_owned();

    // manager.exec_stmt(insert).await?;

    Ok(())
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager.drop_table(Table::drop().table(TbWater::Table).to_owned()).await
  }
}

#[derive(DeriveIden)]
pub enum TbWater {
  Table,
  WaterSeq,
  DispSeq,
  WaterDevId,
  WaterGateSeq, // HP 차단기에서 데이터를 수신받는 경우.
  WaterNm,
  WaterLat,
  WaterLng,
  WaterMod,
  CamSeq,
  // WaterIp,
  // WaterPort,
  WaterType,
  LimitAttn,
  LimitWarn,
  LimitAlert,
  LimitCrit,
  WaterLevel,
  WaterDt,
  WaterStat,
  CommStat, // 통신상태
  GrpId,
}
