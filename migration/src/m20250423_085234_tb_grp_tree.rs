use sea_orm::Statement;
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
          .table(TbGrpTree::Table)
          .comment("그룹구조")
          .if_not_exists()
          .col(string(TbGrpTree::ParentId).string_len(30).comment("부모그룹ID"))
          .col(string(TbGrpTree::ChildId).string_len(30).comment("자식그룹ID"))
          //.col(integer(TbGrpTree::GrpDepth).comment("그룹구조깊이"))
          .foreign_key(
            ForeignKey::create()
              .from(TbGrpTree::Table, TbGrpTree::ParentId)
              .to(TbGrp::Table, TbGrp::GrpId)
              .on_delete(ForeignKeyAction::Cascade)
              .on_update(ForeignKeyAction::Cascade),
          )
          .foreign_key(
            ForeignKey::create()
              .from(TbGrpTree::Table, TbGrpTree::ChildId)
              .to(TbGrp::Table, TbGrp::GrpId)
              .on_delete(ForeignKeyAction::Cascade)
              .on_update(ForeignKeyAction::Cascade),
          )
          .to_owned(),
      )
      .await
      .unwrap();

    let sql = "ALTER TABLE tb_grp_tree ADD CONSTRAINT tb_grp_tree_pk PRIMARY KEY (parent_id, child_id)";
    let stmt = Statement::from_string(manager.get_database_backend(), sql.to_owned());
    manager.get_connection().execute(stmt).await.map(|_| ()).unwrap();

    let insert = Query::insert()
      .into_table(TbGrpTree::Table)
      .columns([TbGrpTree::ParentId, TbGrpTree::ChildId])
      .values_panic(["R001".into(), "R001".into()]) // 자기 자신.
      .to_owned();

    manager.exec_stmt(insert).await?;

    Ok(())
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager.drop_table(Table::drop().table(TbGrpTree::Table).to_owned()).await
  }
}

#[derive(DeriveIden)]
enum TbGrpTree {
  Table,
  ParentId,
  ChildId,
  //GrpDepth,
}
