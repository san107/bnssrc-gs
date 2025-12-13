use migration::m20241201_130535_tb_login::TbLogin;
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    let db = manager.get_connection();
    db.execute_unprepared("delete from tb_login where user_id in ('inst', 'user', 'admin')")
      .await?; // 우선 삭제하고 나서.

    let insert = Query::insert()
      .into_table(TbLogin::Table)
      .columns([
        TbLogin::UserId,
        TbLogin::UserName,
        TbLogin::UserPass,
        TbLogin::UserEmail,
        TbLogin::UserRole,
      ])
      .values_panic(
        [
          "inst",
          "inst",
          "$2b$12$x9oq24qx4I8xmmbstMZF..Q4OsXh3wNCmgU2hhHqdtPYMml201ZMu",
          "inst@bnstech.com",
          "Inst",
        ]
        .map(|ele| ele.into()),
      )
      .values_panic(
        [
          "admin",
          "admin",
          "$2b$12$rKicgifBpn0BSpCjGEb/wuAj8BUimqaKSrr80IW6.viaF3EvQoUVe",
          "admin@bnstech.com",
          "Admin",
        ]
        .map(|ele| ele.into()),
      )
      .values_panic(
        [
          "user",
          "user",
          "$2b$12$Lr5zDlgYyZRy9zzuSKT2ue0dm1iCH2ktXpx4ueU4xSvxpPXjMCnW2",
          "user@bnstech.com",
          "User",
        ]
        .map(|ele| ele.into()),
      )
      .to_owned();

    manager.exec_stmt(insert).await?;

    Ok(())
  }

  async fn down(&self, _manager: &SchemaManager) -> Result<(), DbErr> {
    Ok(())
  }
}
