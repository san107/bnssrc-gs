use crate::entities::prelude::*;
use crate::entities::{tcm_flud_board, tcm_flud_board::ActiveModel};
use crate::ndms::ndms_model::NdmsEbrd;
use chrono::Local;
use sea_orm::*;

#[allow(dead_code)]
pub struct Mtn;
impl Mtn {
  #[allow(dead_code)]
  pub async fn save(db: &DbConn, data: serde_json::Value) -> Result<tcm_flud_board::Model, DbErr> {
    let model: tcm_flud_board::Model = serde_json::from_value(data.clone()).unwrap();

    let key = (model.flcode.clone(), model.cd_dist_board.clone());

    let c: ActiveModel = model.into();
    let mut c = c.reset_all();
    c.updde = ActiveValue::Set(Local::now().naive_local());

    match TcmFludBoard::find_by_id(key).one(db).await {
      Ok(Some(_ele)) => c.update(db).await,
      Ok(None) => {
        c.rgsde = ActiveValue::Set(Local::now().naive_local());
        c.insert(db).await
      }
      Err(e) => Err(e),
    }

    //c.save(db).await
  }

  #[allow(dead_code)]
  pub async fn save_ndms_model(
    db: &DbConn,
    model: tcm_flud_board::Model,
    data: &NdmsEbrd,
  ) -> Result<tcm_flud_board::Model, DbErr> {
    let mut c: ActiveModel = model.into();
    if data.comm_stat.is_some() {
      c.reset(tcm_flud_board::Column::CommSttus);
    }
    if data.msg_board.is_some() {
      c.reset(tcm_flud_board::Column::MsgBoard);
    }

    c.update(db).await
  }

  #[allow(dead_code)]
  pub async fn delete(db: &DbConn, data: serde_json::Value) -> Result<DeleteResult, DbErr> {
    let model: tcm_flud_board::Model = serde_json::from_value(data.clone()).unwrap();

    let key = (model.flcode.clone(), model.cd_dist_board.clone());

    let model: ActiveModel = TcmFludBoard::find_by_id(key)
      .one(db)
      .await?
      .ok_or(DbErr::Custom("Cannot find data.".to_owned()))
      .map(Into::into)?;

    model.delete(db).await
  }
}
