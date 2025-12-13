pub use sea_orm_migration::prelude::*;

mod m20250125_080531_tb_cd;
mod m20250517_055829_tb_ncd;
mod m20250517_074633_tb_login;
mod m20250609_184055_tb_sys_conf;

pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
  fn migration_table_name() -> sea_orm::DynIden {
    Alias::new("_seaql_migrations_seed").into_iden()
  }
  fn migrations() -> Vec<Box<dyn MigrationTrait>> {
    vec![
            Box::new(m20250125_080531_tb_cd::Migration),
            Box::new(m20250517_055829_tb_ncd::Migration),
            Box::new(m20250517_074633_tb_login::Migration),
            Box::new(m20250609_184055_tb_sys_conf::Migration),
        ]
  }
}
