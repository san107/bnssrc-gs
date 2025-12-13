use crate::entities::prelude::*;
use crate::entities::{tcm_cou_dngr_adm, tcm_cou_dngr_adm::ActiveModel};
use chrono::Local;
use log::debug;
use sea_orm::*;

pub struct Mtn;
impl Mtn {
  pub async fn save(db: &DbConn, data: serde_json::Value) -> Result<tcm_cou_dngr_adm::Model, DbErr> {
    //let mut c: ActiveModel = Default::default();
    let id = data.get("admcode");

    let model: tcm_cou_dngr_adm::Model = serde_json::from_value(data.clone()).unwrap();
    log::debug!("model {:?} id {id:?}", model);

    let mut c: ActiveModel = model.into();
    c = c.clone().reset_all();

    let id = id.unwrap().as_str().unwrap();
    c.set(
      tcm_cou_dngr_adm::Column::Admcode,
      sea_orm::Value::String(Some(Box::from(id.to_owned()))),
    );

    c.updde = ActiveValue::Set(Local::now().naive_local());

    debug!("active model {:?}", c);

    match TcmCouDngrAdm::find_by_id(id).one(db).await {
      Ok(Some(_ele)) => c.update(db).await,
      Ok(None) => {
        c.rgsde = ActiveValue::Set(Local::now().naive_local());
        c.insert(db).await
      }
      Err(e) => Err(e),
    }
  }

  pub async fn delete(db: &DbConn, id: &str) -> Result<DeleteResult, DbErr> {
    let model: ActiveModel = TcmCouDngrAdm::find_by_id(id)
      .one(db)
      .await?
      .ok_or(DbErr::Custom("Cannot find data.".to_owned()))
      .map(Into::into)?;

    model.delete(db).await
  }
}
