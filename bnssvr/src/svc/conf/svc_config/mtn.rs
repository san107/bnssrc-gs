use crate::entities::{tb_config, tb_config::ActiveModel};
use sea_orm::*;

#[allow(dead_code)]
pub struct Mtn;
impl Mtn {
  pub async fn save_config(db: &DbConn, data: serde_json::Value, grp_id: String) -> Result<tb_config::Model, DbErr> {
    let mut c: ActiveModel = Default::default();
    let id = data.get("grp_id");
    let mut data = data.clone();
    if id == None {
      let v: serde_json::Value = grp_id.clone().into();
      data["grp_id"] = v;
    }
    c.set_from_json(data.clone()).unwrap();
    log::info!("c {:?}", c);

    c.set(
      tb_config::Column::GrpId,
      sea_orm::Value::String(Some(Box::from(data.get("grp_id").unwrap().as_str().unwrap().to_owned()))),
    );
    log::info!("c2 {:?}", c);

    let exist = tb_config::Entity::find()
      .filter(tb_config::Column::GrpId.eq(grp_id))
      .one(db)
      .await?;

    if let Some(_exist) = exist {
      c.update(db).await
    } else {
      c.insert(db).await
    }
  }
}
