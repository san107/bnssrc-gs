mod cam_mgr;
mod rtspapp;
pub mod stat_mgr;
use log::info;
use sea_orm::DbConn;

pub async fn main(conn: DbConn) {
  info!("RTSP main 시작");
  tokio::spawn(async move {
    rtspapp::main(conn).await;
  });
  info!("RTSP main 완료");
}
