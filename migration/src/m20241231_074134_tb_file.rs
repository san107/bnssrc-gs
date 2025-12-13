use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .create_table(
        Table::create()
          .table(TbFile::Table)
          .comment("파일")
          .if_not_exists()
          .col(pk_auto(TbFile::FileSeq))
          .col(string(TbFile::FileNm).string_len(256).comment("파일명"))
          .col(integer(TbFile::FileSize).comment("파일크기"))
          //.col(blob(TbFile::FileData).comment("파일데이터"))
          .col(
            ColumnDef::new(TbFile::FileData)
              //.binary()
              .custom("LONGBLOB")
              .not_null()
              .comment("파일데이터"),
          )
          .col(integer(TbFile::FileRefCnt).default(1).comment("참조카운트")) // 여러 레코드가 하나의 파일을 참조할 수 있음
          .to_owned(),
      )
      .await?;

    // let sql = "alter table tb_file modify file_data LONGBLOB NOT NULL";
    // let stmt = Statement::from_string(manager.get_database_backend(), sql.to_owned());
    //manager.get_connection().execute(stmt).await.map(|_| ())?;

    Ok(())
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager.drop_table(Table::drop().table(TbFile::Table).to_owned()).await
  }
}

#[derive(DeriveIden)]
pub enum TbFile {
  Table,
  FileSeq,
  FileNm,
  FileSize,
  FileData,
  FileRefCnt,
}
