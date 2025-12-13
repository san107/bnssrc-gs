use crate::{
  ebrd::cmds,
  entities::tb_ebrd,
  ndms::ndms_app::ndms_send_ebrd_stat,
  svc::ebrd::{svc_ebrd, svc_ebrd_hist},
  ws::wsmodels::{WsCmd, WsEbrdStat, WsMsg},
};
use sea_orm::DbConn;
use tokio::sync::broadcast;

pub mod app;
pub mod app_cmd_loop;
pub mod app_disp_msg;
pub mod app_stat;
pub mod model;
pub mod webcmd;

pub async fn update_ebrd_stat(
  db: &DbConn,
  tx_ws: &broadcast::Sender<Box<String>>,
  model: &tb_ebrd::Model,
  comm_stat: &str,
  cmd_err: &Option<cmds::cmd_err::CmdErr>,
  msg: &str,
) -> Result<(), ()> {
  let mut cmd_rslt_cd: Option<i32> = None;
  let cmd_rslt = if comm_stat == "Ok" {
    if cmd_err.is_none() {
      "Success"
    } else {
      cmd_rslt_cd = Some(cmd_err.as_ref().unwrap().err_code as i32);
      "Fail"
    }
  } else {
    ""
  };

  if Some(cmd_rslt.to_string()) == model.cmd_rslt
    && cmd_rslt_cd == model.cmd_rslt_cd
    && Some(comm_stat.to_owned()) == model.comm_stat
  {
    return Ok(());
  }

  let _ = svc_ebrd::mtn::Mtn::update_comm_stat(&db, model.ebrd_seq, &model.ebrd_id, comm_stat, &cmd_rslt, cmd_rslt_cd)
    .await
    .map_err(|e| {
      log::error!("update_comm_stat error: {:?}", e);
      ()
    })?;

  let json = serde_json::json!({ "msg": msg, "cmd_err": cmd_err.as_ref() });
  svc_ebrd_hist::mtn::Mtn::insert(&db, model.ebrd_seq, &model.ebrd_id, comm_stat, &cmd_rslt, cmd_rslt_cd, json)
    .await
    .map_err(|e| {
      log::error!("insert error: {:?}", e);
      ()
    })?;

  // ndms_ebrd 상태 업데이트 하도록.( 웹소켓 상태 전송시점에 처리.)
  ndms_send_ebrd_stat(model.ebrd_seq, comm_stat).await;

  let _ = tx_ws.send(Box::from(
    serde_json::to_string(&WsMsg {
      cmd: WsCmd::EbrdStat,
      data: WsEbrdStat {
        ebrd_seq: model.ebrd_seq,
        ebrd_id: model.ebrd_id.clone(),
        comm_stat: comm_stat.to_string(),
        cmd_rslt: cmd_rslt.to_string(),
        cmd_rslt_cd: cmd_rslt_cd,
        msg: msg.to_string(),
      },
    })
    .unwrap_or("{}".to_owned()),
  ));

  Ok(())
}
