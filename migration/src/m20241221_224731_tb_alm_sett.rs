use sea_orm::Statement;
use sea_orm_migration::{prelude::*, schema::*};

use crate::{m20241204_141048_tb_water::TbWater, m20241221_222926_tb_alm_user::TbAlmUser};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .create_table(
        Table::create()
          .table(TbAlmSett::Table)
          .comment("알람설정")
          .if_not_exists()
          .col(integer(TbAlmSett::WaterSeq).comment("수위계일련번호"))
          .col(integer(TbAlmSett::AlmUserSeq).comment("알람사용자일련번호"))
          .col(string(TbAlmSett::SmsAttnYn).string_len(1).comment("SMS관심수신여부"))
          .col(string(TbAlmSett::SmsWarnYn).string_len(1).comment("SMS주의수신여부"))
          .col(string(TbAlmSett::SmsAlertYn).string_len(1).comment("SMS경계수신여부"))
          .col(string(TbAlmSett::SmsCritYn).string_len(1).comment("SMS심각수신여부"))
          .foreign_key(
            ForeignKey::create()
              .from(TbAlmSett::Table, TbAlmSett::AlmUserSeq)
              .to(TbAlmUser::Table, TbAlmUser::AlmUserSeq)
              .on_delete(ForeignKeyAction::Cascade)
              .on_update(ForeignKeyAction::Cascade),
          )
          .foreign_key(
            ForeignKey::create()
              .from(TbAlmSett::Table, TbAlmSett::WaterSeq)
              .to(TbWater::Table, TbWater::WaterSeq)
              .on_delete(ForeignKeyAction::Cascade)
              .on_update(ForeignKeyAction::Cascade),
          )
          .to_owned(),
      )
      .await
      .unwrap();

    let sql = "ALTER TABLE tb_alm_sett ADD CONSTRAINT tb_alm_sett_pk PRIMARY KEY (water_seq, alm_user_seq)";
    let stmt = Statement::from_string(manager.get_database_backend(), sql.to_owned());
    manager.get_connection().execute(stmt).await.map(|_| ()).unwrap();

    /* seed  */
    // let insert = Query::insert()
    //   .into_table(TbAlmSett::Table)
    //   .columns([
    //     TbAlmSett::WaterSeq,
    //     TbAlmSett::AlmUserSeq,
    //     TbAlmSett::SmsAttnYn,
    //     TbAlmSett::SmsWarnYn,
    //     TbAlmSett::SmsAlertYn,
    //     TbAlmSett::SmsCritYn,
    //   ])
    //   .values_panic([1.into(), 1.into(), "Y".into(), "N".into(), "Y".into(), "Y".into()])
    //   .values_panic([1.into(), 2.into(), "Y".into(), "Y".into(), "N".into(), "Y".into()])
    //   .values_panic([2.into(), 1.into(), "Y".into(), "N".into(), "N".into(), "N".into()])
    //   .values_panic([2.into(), 2.into(), "N".into(), "N".into(), "Y".into(), "N".into()])
    //   .values_panic([3.into(), 1.into(), "Y".into(), "N".into(), "N".into(), "Y".into()])
    //   .values_panic([3.into(), 2.into(), "N".into(), "Y".into(), "Y".into(), "N".into()])
    //   .to_owned();

    // manager.exec_stmt(insert).await?;

    Ok(())
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager.drop_table(Table::drop().table(TbAlmSett::Table).to_owned()).await
  }
}

#[derive(DeriveIden)]
enum TbAlmSett {
  Table,
  WaterSeq,
  AlmUserSeq,
  SmsAttnYn,
  SmsWarnYn,
  SmsAlertYn,
  SmsCritYn,
}
