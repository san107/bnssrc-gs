use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .create_table(
        Table::create()
          .table(TbGrp::Table)
          .comment("그룹")
          .if_not_exists()
          .col(string(TbGrp::GrpId).primary_key().string_len(30).comment("그룹ID"))
          .col(string(TbGrp::GrpNm).string_len(64).comment("그룹명"))
          .col(string(TbGrp::GrpDesc).string_len(256).comment("그룹설명"))
          .to_owned(),
      )
      .await
      .unwrap();

    let insert = Query::insert()
      .into_table(TbGrp::Table)
      .columns([TbGrp::GrpId, TbGrp::GrpNm, TbGrp::GrpDesc])
      .values_panic(["R001".into(), "최상위".into(), "최상위그룹".into()])
      .to_owned();

    manager.exec_stmt(insert).await?;

    Ok(())
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager.drop_table(Table::drop().table(TbGrp::Table).to_owned()).await
  }
}

#[derive(DeriveIden)]
pub enum TbGrp {
  Table,
  GrpId,
  GrpNm,
  GrpDesc,
}
