use crate::entities::prelude::*;
use crate::entities::{tb_grp_tree, tb_grp_tree::ActiveModel};
use crate::svc::user::svc_grp_tree;
use sea_orm::*;

#[allow(dead_code)]
pub struct Mtn;
impl Mtn {
  pub async fn save_grp_tree_recursive<C>(db: &C, p_grp_id: String, child_id: String) -> Result<(), DbErr>
  where
    C: ConnectionTrait,
  {
    // 1. child_id 가 변경되어야 하므로, child_id  가 들어있는 모든 데이터를 지운다.
    // 2. parent child 관계를 설정한다. (p_grp_id, child_id), (child_id, child_id)
    // 2-1.child의 레벨은 parent 의 레벨 + 1 이다.
    // 3. parent 의 parent 에 대해서도 재귀적으로 child 설정을 추가한다.(pp_grp_id, child_id) 0레벨이 나올때까지.

    // Delete all records where this child_id appears
    TbGrpTree::delete_many()
      .filter(
        tb_grp_tree::Column::ChildId
          .eq(child_id.clone())
          .or(tb_grp_tree::Column::ParentId.eq(child_id.clone())),
      )
      .exec(db)
      .await?;

    let mut models: Vec<ActiveModel> = vec![];

    //let parent = TbGrpTree::find_by_id((p_grp_id.clone(), p_grp_id.clone()))
    //  .one(db)
    //  .await?
    //  .ok_or(DbErr::Custom("parent not found".to_owned()))?;

    //let grp_depth = parent.grp_depth + 1;
    // let mut g: ActiveModel = Default::default();
    // g.parent_id = Set(p_grp_id.clone());
    // g.child_id = Set(child_id.clone());
    // g.grp_depth = Set(grp_depth);
    // models.push(g);
    let mut g: ActiveModel = Default::default();
    g.parent_id = Set(child_id.clone());
    g.child_id = Set(child_id.clone());
    //g.grp_depth = Set(grp_depth);
    models.push(g);

    let parents = svc_grp_tree::qry::Qry::find_by_child(db, &p_grp_id).await?;

    for p in parents {
      // if p.parent_id == child_id {
      //   continue;
      // }
      let mut g: ActiveModel = Default::default();

      g.parent_id = Set(p.parent_id.clone());
      g.child_id = Set(child_id.clone());
      //g.grp_depth = Set(grp_depth);
      models.push(g);
    }

    TbGrpTree::insert_many(models).exec(db).await?;

    Ok(())
  }
  pub async fn save_grp_tree(db: &DbConn, data: serde_json::Value) -> Result<tb_grp_tree::Model, DbErr> {
    let mut g: ActiveModel = Default::default();
    let parent_id = data.get("parent_id");
    let child_id = data.get("child_id");

    if parent_id == None || child_id == None {
      return Err(DbErr::Custom("parent_id and child_id are required".to_owned()));
    }

    let parent_id_str = parent_id.unwrap().as_str().unwrap().to_owned();
    let child_id_str = child_id.unwrap().as_str().unwrap().to_owned();

    // tb_grp 테이블에 child_id가 존재하는지 확인
    let child_exists = TbGrp::find_by_id(child_id_str.clone()).one(db).await?;

    if child_exists.is_none() {
      return Err(DbErr::Custom(format!("child_id ({}) does not exist", child_id_str)));
    }

    // 기존 데이터 조회
    let existing = TbGrpTree::find_by_id((parent_id_str.clone(), child_id_str.clone()))
      .one(db)
      .await?;

    g.set_from_json(data.clone()).unwrap();

    g.set(
      tb_grp_tree::Column::ParentId,
      sea_orm::Value::String(Some(Box::from(parent_id_str.clone()))),
    );

    g.set(
      tb_grp_tree::Column::ChildId,
      sea_orm::Value::String(Some(Box::from(child_id_str.clone()))),
    );

    if existing.is_some() {
      g.update(db).await
    } else {
      g.insert(db).await
    }
  }

  pub async fn delete_grp_tree(db: &DbConn, parent_id: &str, child_id: &str) -> Result<DeleteResult, DbErr> {
    let model: ActiveModel = TbGrpTree::find_by_id((parent_id.to_owned(), child_id.to_owned()))
      .one(db)
      .await?
      .ok_or(DbErr::Custom("Cannot find data.".to_owned()))
      .map(Into::into)?;

    model.delete(db).await
  }

  pub async fn delete_grp_tree_recursive<C>(db: &C, child_id: String) -> Result<DeleteResult, DbErr>
  where
    C: ConnectionTrait,
  {
    TbGrpTree::delete_many()
      .filter(
        tb_grp_tree::Column::ChildId
          .eq(child_id.clone())
          .or(tb_grp_tree::Column::ParentId.eq(child_id)),
      )
      .exec(db)
      .await
  }
}
