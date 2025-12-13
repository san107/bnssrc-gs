use anyhow::{Context, Result};
use tokio::io::AsyncWriteExt;
use tokio::net::TcpStream;

/*
 * 전송데이터의 길이가 버퍼의 길이와 다른 경우는 소켓 쓰기 실패로 간주한다.
*/
pub async fn send(stream: &mut TcpStream, sbytes: &Vec<u8>) -> Result<()> {
  let s = stream.write(sbytes).await.context("소켓 쓰기 실패")?;
  if s != sbytes.len() {
    return Err(anyhow::anyhow!(format!("소켓 쓰기 실패 send:{} != req:{}", s, sbytes.len())));
  }
  Ok(())
}
