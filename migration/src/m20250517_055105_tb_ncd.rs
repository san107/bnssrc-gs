use sea_orm_migration::{prelude::*, schema::*, sea_orm::Statement};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .create_table(
        Table::create()
          .table(TbNcd::Table)
          .comment("정수형 코드")
          .if_not_exists()
          .col(string(TbNcd::NcdGrp).string_len(30).comment("코드 그룹"))
          .col(integer(TbNcd::NcdId).comment("코드 ID"))
          .col(string(TbNcd::NcdNm).string_len(64).comment("코드 명"))
          .col(integer(TbNcd::NcdSeq).comment("코드 순서"))
          .to_owned(),
      )
      .await?;

    let sql = "ALTER TABLE tb_ncd ADD CONSTRAINT tb_ncd_pk PRIMARY KEY (ncd_grp, ncd_id)";
    let stmt = Statement::from_string(manager.get_database_backend(), sql.to_owned());
    manager.get_connection().execute(stmt).await.map(|_| ()).unwrap();

    Ok(())
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager.drop_table(Table::drop().table(TbNcd::Table).to_owned()).await
  }
}

#[derive(DeriveIden)]
pub enum TbNcd {
  Table,
  NcdGrp,
  NcdId,
  NcdNm,
  NcdSeq,
}
