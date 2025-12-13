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
          .table(TbCamera::Table)
          .comment("카메라")
          .if_not_exists()
          .col(pk_auto(TbCamera::CamSeq).comment("카메라일련번호"))
          .col(integer(TbCamera::DispSeq).null().comment("표시순서"))
          .col(double(TbCamera::CamLat).comment("위도"))
          .col(double(TbCamera::CamLng).comment("경도"))
          .col(string(TbCamera::CamNm).string_len(64).comment("카메라명"))
          .col(string(TbCamera::CamType).string_len(30).comment("카메라유형"))
          .col(string(TbCamera::CamIp).string_len(30).comment("카메라IP"))
          .col(integer(TbCamera::CamPort).comment("카메라PORT"))
          .col(string(TbCamera::CamUserId).string_len(30).comment("카메라계정ID"))
          .col(string(TbCamera::CamPass).string_len(30).comment("카메라계정비밀번호"))
          .col(string(TbCamera::CamPathS).string_len(128).comment("저해상도경로"))
          .col(string(TbCamera::CamPathL).string_len(128).comment("고해상도경로"))
          .col(string(TbCamera::CamStat).string_len(30).null().comment("카메라상태"))
          .col(date_time(TbCamera::CamStatDt).null().comment("카메라상태일시"))
          .col(string(TbCamera::GrpId).string_len(30).default("R001").comment("그룹ID"))
          .foreign_key(
            ForeignKey::create()
              .from(TbCamera::Table, TbCamera::GrpId)
              .to(TbGrp::Table, TbGrp::GrpId)
              .on_delete(ForeignKeyAction::Cascade)
              .on_update(ForeignKeyAction::Cascade),
          )
          .to_owned(),
      )
      .await
      .unwrap();

    // let insert = Query::insert()
    //   .into_table(TbCamera::Table)
    //   .columns([
    //     TbCamera::CamLat,
    //     TbCamera::CamLng,
    //     TbCamera::CamNm,
    //     TbCamera::CamIp,
    //     TbCamera::CamPort,
    //     TbCamera::CamUserId,
    //     TbCamera::CamPass,
    //     TbCamera::CamPathS,
    //     TbCamera::CamPathL,
    //     TbCamera::CamType,
    //   ])
    //   .values_panic([
    //     37.7168211.into(),
    //     127.1910456.into(),
    //     "13 연구소 9996".into(),
    //     "221.140.147.154".into(),
    //     9996.into(),
    //     "admin".into(),
    //     "admin2202!!".into(),
    //     "/video1s3".into(),
    //     "/video1s2".into(),
    //     "Seo".into(),
    //   ])
    //   .values_panic([
    //     37.7168550.into(),
    //     127.1830848.into(),
    //     "125 연구소 9995 4".into(),
    //     "221.140.147.154".into(),
    //     9995.into(),
    //     "admin".into(),
    //     "admin2202!!".into(),
    //     "/trackID=4".into(),
    //     "/trackID=4".into(),
    //     "Idis".into(),
    //   ])
    //   .values_panic([
    //     37.7162482.into(),
    //     127.1823338.into(),
    //     "125 연구소 9995 2".into(),
    //     "221.140.147.154".into(),
    //     9995.into(),
    //     "admin".into(),
    //     "admin2202!!".into(),
    //     "/trackID=2".into(),
    //     "/trackID=2".into(),
    //     "Idis".into(),
    //   ])
    //   .values_panic([
    //     37.7159961.into(),
    //     127.1834195.into(),
    //     "125 연구소 9995 3".into(),
    //     "221.140.147.154".into(),
    //     9995.into(),
    //     "admin".into(),
    //     "admin2202!!".into(),
    //     "/trackID=3".into(),
    //     "/trackID=3".into(),
    //     "Idis".into(),
    //   ])
    //   .values_panic([
    //     37.7159961.into(),
    //     127.1834195.into(),
    //     "125 연구소 8995".into(),
    //     "221.140.147.154".into(),
    //     8995.into(),
    //     "admin".into(),
    //     "admin2202!!".into(),
    //     "/trackID=3".into(),
    //     "/trackID=3".into(),
    //     "Idis".into(),
    //   ])
    //   .values_panic([
    //     37.7163589.into(),
    //     127.1885458.into(),
    //     "235 회의실 9990".into(),
    //     "221.140.147.154".into(),
    //     9990.into(),
    //     "admin".into(),
    //     "admin2202!!".into(),
    //     "/trackID=3".into(),
    //     "/trackID=3".into(),
    //     "Idis".into(),
    //   ])
    //   .values_panic([
    //     37.7146297.into(),
    //     127.1830571.into(),
    //     "내부 1920".into(),
    //     "192.168.0.187".into(),
    //     554.into(), // rtsp default port no.
    //     "admin".into(),
    //     "admin2202!!".into(),
    //     "/trackID=1".into(),
    //     "/trackID=1".into(),
    //     "Idis".into(),
    //   ])
    //   .values_panic([
    //     37.7160152.into(),
    //     127.1852191.into(),
    //     "내부 640".into(),
    //     "192.168.0.187".into(),
    //     554.into(),
    //     "admin".into(),
    //     "admin2202!!".into(),
    //     "/trackID=2".into(),
    //     "/trackID=2".into(),
    //     "Idis".into(),
    //   ])
    //   .values_panic([
    //     37.7174752.into(),
    //     127.1857241.into(),
    //     "161 cctv 9987".into(),
    //     "221.140.147.154".into(),
    //     9987.into(),
    //     "admin".into(),
    //     "admin2202!!".into(),
    //     "/trackID=3".into(),
    //     "/trackID=3".into(),
    //     "Idis".into(),
    //   ])
    //   .values_panic([
    //     37.7174752.into(),
    //     127.1857241.into(),
    //     "161 cctv 8987".into(),
    //     "221.140.147.154".into(),
    //     8987.into(),
    //     "admin".into(),
    //     "admin2202!!".into(),
    //     "/trackID=3".into(),
    //     "/trackID=3".into(),
    //     "Idis".into(),
    //   ])
    //   .values_panic([
    //     37.7175007.into(),
    //     127.1866038.into(),
    //     "175 회의실 9986".into(),
    //     "221.140.147.154".into(),
    //     9986.into(),
    //     "admin".into(),
    //     "admin2202!!".into(),
    //     "/trackID=3".into(),
    //     "/trackID=3".into(),
    //     "Idis".into(),
    //   ])
    //   .values_panic([
    //     37.7182136.into(),
    //     127.1870544.into(),
    //     "162 cctv 9985".into(),
    //     //  "rtsp://admin:admin2202!!@221.140.147.154:9995/trackID=3".into(),
    //     "221.140.147.154".into(),
    //     9985.into(),
    //     "admin".into(),
    //     "admin2202!!".into(),
    //     "/trackID=3".into(),
    //     "/trackID=3".into(),
    //     "Idis".into(),
    //   ])
    //   .values_panic([
    //     37.7182136.into(),
    //     127.1870544.into(),
    //     "162 cctv 8985".into(),
    //     "221.140.147.154".into(),
    //     8985.into(),
    //     "admin".into(),
    //     "admin2202!!".into(),
    //     "/trackID=3".into(),
    //     "/trackID=3".into(),
    //     "Idis".into(),
    //   ])
    //   .values_panic([
    //     37.7240622.into(),
    //     127.1879129.into(),
    //     "163 연구소 ptz 9001".into(),
    //     "221.140.147.154".into(),
    //     9001.into(),
    //     "admin".into(),
    //     "admin2202!!".into(),
    //     "/trackID=3".into(),
    //     "/trackID=2".into(),
    //     "Idis".into(),
    //   ])
    //   .values_panic([
    //     37.7240722.into(),
    //     127.1879329.into(),
    //     "164 연구소".into(),
    //     "221.140.147.154".into(),
    //     9002.into(),
    //     "admin".into(),
    //     "admin2202!!".into(),
    //     "/trackID=4".into(),
    //     "/trackID=3".into(),
    //     "Idis".into(),
    //   ])
    //   .values_panic([
    //     37.7231298.into(),
    //     127.1885381.into(),
    //     "128 idis ptz 9003회".into(),
    //     "221.140.147.154".into(),
    //     9003.into(),
    //     "admin".into(),
    //     "admin2202!!".into(),
    //     "/trackID=2".into(),
    //     "/trackID=1".into(),
    //     "Idis".into(),
    //   ])
    //   .values_panic([
    //     37.7210835.into(),
    //     127.1976225.into(),
    //     "235 idis ptz 9004연".into(),
    //     "221.140.147.154".into(),
    //     9004.into(),
    //     "admin".into(),
    //     "admin2202!!".into(),
    //     "/trackID=2".into(),
    //     "/trackID=1".into(),
    //     "Idis".into(),
    //   ])
    //   .to_owned();

    // manager.exec_stmt(insert).await?;

    Ok(())
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager.drop_table(Table::drop().table(TbCamera::Table).to_owned()).await
  }
}

#[derive(DeriveIden)]
pub enum TbCamera {
  Table,
  CamSeq,
  DispSeq,
  CamLat,
  CamLng,
  CamNm,
  CamIp,
  CamPort,
  CamUserId,
  CamPass,
  CamPathS,
  CamPathL,
  CamType,
  CamStat,
  CamStatDt,
  GrpId,
}
