use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .create_table(
        Table::create()
          .table(TbWeather::Table)
          .comment("날씨")
          .if_not_exists()
          .col(pk_auto(TbWeather::WtSeq).comment("일련번호"))
          .col(string(TbWeather::WtRgnNm).string_len(64).comment("지역명"))
          .col(double(TbWeather::WtLat).comment("위도"))
          .col(double(TbWeather::WtLng).comment("경도"))
          .col(integer(TbWeather::DispSeq).null().comment("표시순서"))
          .to_owned(),
      )
      .await
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager.drop_table(Table::drop().table(TbWeather::Table).to_owned()).await
  }
}

#[derive(DeriveIden)]
enum TbWeather {
  Table,
  WtSeq,
  WtRgnNm,
  WtLat,
  WtLng,
  DispSeq,
}
