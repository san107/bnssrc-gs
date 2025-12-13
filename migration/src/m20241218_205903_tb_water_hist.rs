use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .create_table(
        Table::create()
          .table(TbWaterHist::Table)
          .comment("수위이력")
          .if_not_exists()
          .col(pk_auto(TbWaterHist::WaterHistSeq).comment("수위이력일련번호"))
          .col(string(TbWaterHist::WaterDevId).string_len(30).comment("수위계DeviceID"))
          .col(date_time(TbWaterHist::WaterDt).comment("수위측정일시"))
          .col(double(TbWaterHist::WaterLevel).comment("수위(m)"))
          .to_owned(),
      )
      .await
      .unwrap();

    manager
      .create_index(
        Index::create()
          .name("idx_water_hist_01")
          .table(TbWaterHist::Table)
          .col(TbWaterHist::WaterDevId)
          .col(TbWaterHist::WaterDt)
          .to_owned(),
      )
      .await?;

    // let insert = Query::insert()
    //   .into_table(TbWaterHist::Table)
    //   .columns([TbWaterHist::WaterDevId, TbWaterHist::WaterDt, TbWaterHist::WaterLevel])
    //   .values_panic(["DEV001".into(), "2024-12-19 08:34:00".into(), 0.1.into()])
    //   .values_panic(["DEV001".into(), "2024-12-19 08:35:00".into(), 0.1.into()])
    //   .values_panic(["DEV001".into(), "2024-12-19 08:36:00".into(), 0.1.into()])
    //   .values_panic(["DEV001".into(), "2024-12-19 08:37:00".into(), 0.2.into()])
    //   .values_panic(["DEV001".into(), "2024-12-19 08:38:00".into(), 0.3.into()])
    //   .to_owned();

    // manager.exec_stmt(insert).await?;

    Ok(())
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager.drop_table(Table::drop().table(TbWaterHist::Table).to_owned()).await
  }
}

#[derive(DeriveIden)]
enum TbWaterHist {
  Table,
  WaterHistSeq,
  WaterDevId,
  WaterDt,
  WaterLevel,
}
