use crate::{
  entities::{prelude::*, tb_water_grp_stat},
  ws::wsmodels::{GrpAction, GrpStat},
};
use sea_orm::*;

#[allow(dead_code)]
pub struct Mtn;
impl Mtn {
  pub async fn update_stat(db: &DbConn, water_grp_id: &str, grp_stat: GrpStat) -> Result<(), DbErr> {
    //let mut am: tb_water_grp_stat::ActiveModel = Default::default();

    let stat = TbWaterGrpStat::find_by_id(water_grp_id).one(db).await?;
    match stat {
      Some(stat) => {
        // 모델을 ActiveModel로 변환
        let mut am: tb_water_grp_stat::ActiveModel = stat.into();
        am.grp_stat = Set(grp_stat.to_string());
        am.action = Set(GrpAction::None.to_string());
        am.update(db).await?;
      }
      None => {
        let mut am: tb_water_grp_stat::ActiveModel = Default::default();
        am.water_grp_id = Set(water_grp_id.to_string());
        am.grp_stat = Set(grp_stat.to_string());
        am.action = Set(GrpAction::None.to_string());
        am.insert(db).await?;
      }
    }

    Ok(())
  }

  pub async fn update_action(db: &DbConn, water_grp_id: &str, action: GrpAction) -> Result<(), DbErr> {
    let mut am: tb_water_grp_stat::ActiveModel = Default::default();
    am.water_grp_id = Set(water_grp_id.to_string());
    am.action = Set(action.to_string());
    am.update(db).await?;
    Ok(())
  }
}
