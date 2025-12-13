use crate::entities::prelude::*;
use crate::entities::{tb_grp, tb_grp::ActiveModel};
use crate::svc::user::{svc_grp, svc_grp_tree};
use sea_orm::*;

#[allow(dead_code)]
pub struct Mtn;
impl Mtn {
  pub async fn save_grp(db: &DbConn, data: serde_json::Value, login_grp_id: String) -> Result<tb_grp::Model, DbErr> {
    let grp_id = data
      .get("grp_id")
      .ok_or(DbErr::Custom("grp_id is required".to_owned()))?
      .as_str()
      .ok_or(DbErr::Custom("grp_id is required".to_owned()))?;

    let p_grp_id = data
      .get("p_grp_id")
      .ok_or(DbErr::Custom("p_grp_id is required".to_owned()))?
      .as_str()
      .ok_or(DbErr::Custom("p_grp_id is required".to_owned()))?;

    // p_grp_id 는 login_grp_id와 같거나 자식이어야 한다.
    let exist = svc_grp_tree::qry::Qry::exist_by_id(db, login_grp_id.as_str(), p_grp_id).await?;
    if !exist {
      return Err(DbErr::Custom("p_grp_id is not a child of login_grp_id".to_owned()));
    }

    // grp_id 는 새로운 그룹인지 체크.
    let exist = svc_grp::qry::Qry::exist_by_id(db, grp_id).await?;
    if exist {
      // 이미 존재하는 그룹이면, 이 grp_id는, login_grp_id의 자식이어야 한다.
      let exist = svc_grp_tree::qry::Qry::exist_by_id(db, login_grp_id.as_str(), grp_id).await?;
      if !exist {
        return Err(DbErr::Custom("grp_id is not a child of login_grp_id".to_owned()));
      }
    }

    let mut am: ActiveModel = Default::default();
    am.set_from_json(data.clone()).unwrap();

    am.set(
      tb_grp::Column::GrpId,
      sea_orm::Value::String(Some(Box::from(grp_id.to_owned()))),
    );

    let tx = db.begin().await?;

    let model = match TbGrp::find_by_id(grp_id).one(db).await {
      Ok(Some(_ele)) => am.update(&tx).await,
      Ok(None) => {
        let model = am.insert(&tx).await;
        model
      }
      Err(e) => Err(e),
    };

    svc_grp_tree::mtn::Mtn::save_grp_tree_recursive(&tx, p_grp_id.to_owned(), grp_id.to_owned()).await?;

    match tx.commit().await {
      Ok(_) => model,
      Err(e) => Err(e),
    }
  }

  pub async fn delete_grp(db: &DbConn, id: &str) -> Result<DeleteResult, DbErr> {
    // 자식이 있는 경우에는 삭제할 수 없도록 처리함.
    let count = svc_grp_tree::qry::Qry::count_by_parent(db, id).await?;
    if count > 1 {
      return Err(DbErr::Custom("자식이 있어서 삭제할 수 없습니다.".to_owned()));
    }

    let tx = db.begin().await?;
    let model: ActiveModel = TbGrp::find_by_id(id)
      .one(db)
      .await?
      .ok_or(DbErr::Custom("Cannot find data.".to_owned()))
      .map(Into::into)?;

    let result = model.delete(&tx).await;

    svc_grp_tree::mtn::Mtn::delete_grp_tree_recursive(&tx, id.to_owned()).await?;

    match tx.commit().await {
      Ok(_) => result,
      Err(e) => Err(e),
    }
  }
}
