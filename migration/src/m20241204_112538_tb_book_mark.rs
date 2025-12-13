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
          .table(TbBookMark::Table)
          .comment("북마크")
          .if_not_exists()
          .col(pk_auto(TbBookMark::BmSeq).comment("북마크일련번호"))
          .col(double(TbBookMark::BmLat).comment("위도"))
          .col(double(TbBookMark::BmLng).comment("경도"))
          .col(float(TbBookMark::BmZoom).comment("줌"))
          .col(string(TbBookMark::BmNm).string_len(64).comment("북마크명"))
          .col(string(TbBookMark::GrpId).string_len(30).default("R001").comment("그룹ID"))
          .foreign_key(
            ForeignKey::create()
              .from(TbBookMark::Table, TbBookMark::GrpId)
              .to(TbGrp::Table, TbGrp::GrpId)
              .on_delete(ForeignKeyAction::Cascade)
              .on_update(ForeignKeyAction::Cascade),
          )
          .to_owned(),
      )
      .await
      .unwrap();
    //.values_panic(["MAIN".into(), 37.7197513.into(), 127.1890969.into(), 15.9.into()])
    let insert = Query::insert()
      .into_table(TbBookMark::Table)
      .columns([TbBookMark::BmLat, TbBookMark::BmLng, TbBookMark::BmZoom, TbBookMark::BmNm])
      .values_panic([37.7197513.into(), 127.1890969.into(), 15.9.into(), "기본홈".into()])
      .values_panic([37.7226783.into(), 127.1927656.into(), 19.into(), "금곡교".into()])
      .values_panic([37.7053260.into(), 127.1935195.into(), 17.into(), "오남역".into()])
      .values_panic([37.7429741.into(), 127.1996373.into(), 18.0.into(), "광릉사랑요양원".into()])
      .to_owned();

    manager.exec_stmt(insert).await?;

    Ok(())
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager.drop_table(Table::drop().table(TbBookMark::Table).to_owned()).await
  }
}

#[derive(DeriveIden)]
enum TbBookMark {
  Table,
  BmSeq,
  BmLat,
  BmLng,
  BmZoom,
  BmNm,
  GrpId,
}
