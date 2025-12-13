use super::stat_mgr::CamStat;
//use base64::{engine::general_purpose::STANDARD as BASE64, Engine as _};
use log::{debug, error, info, warn};
use std::{collections::HashMap, ops::ControlFlow, process::Stdio, sync::Arc};
use tokio::{
  io::AsyncReadExt,
  process::{Child, ChildStdout, Command},
  sync::{mpsc::error::TryRecvError, Mutex},
};

#[derive(Debug, PartialEq)]
pub enum CamResolution {
  Small,
  Large,
}

#[allow(dead_code)]
#[derive(Debug)]
pub struct CamInfo {
  pub path: String,
  pub rtsp_url: String,
  pub resolution: CamResolution,
  pub tx: tokio::sync::mpsc::Sender<BinInfo>,
  pub cam_seq: Option<i32>,
}

struct ChildInfo {
  child: Option<Child>,
  exit: bool,
}

pub struct BinInfo {
  #[allow(dead_code)]
  pub tr_id: usize,
  pub bin: Box<Vec<u8>>,
}

type TxBin = tokio::sync::mpsc::Sender<BinInfo>;

type TxBinBin = tokio::sync::mpsc::Sender<TxBin>;
type RxBinBin = tokio::sync::mpsc::Receiver<TxBin>;

fn get_command(url: &str, resolution: &CamResolution) -> Command {
  let mut cmd = Command::new("ffmpeg");
  let log_level = crate::util::get_env_str("FFMPEG_LOG_LEVEL", "error");

  let mut cmdstr = Vec::new();
  // let base64 = BASE64.encode(format!("{}:{}", "admin", "admin2022!!"));
  // let base64 = format!("Authorization: Basic {}", base64);
  // cmdstr.push("-headers");
  // cmdstr.push(base64.as_str());
  cmdstr.push("-err_detect");
  cmdstr.push("ignore_err");
  cmdstr.push("-loglevel");
  cmdstr.push(log_level.as_str());
  cmdstr.push("-rtsp_transport");
  cmdstr.push("tcp");
  // cmdstr.push("-rtsp_flags prefer_tcp");
  // cmdstr.push("-reconnect 2");
  // cmdstr.push("-reconnect_at_eof 1");
  // cmdstr.push("-reconnect_streamed 1");
  // cmdstr.push("-reconnect_delay_max 5");
  cmdstr.push("-i");
  cmdstr.push(url);
  cmdstr.push("-f");
  cmdstr.push("mpegts");
  cmdstr.push("-codec:v");
  cmdstr.push("mpeg1video");
  cmdstr.push("-r");
  cmdstr.push("30");
  if *resolution == CamResolution::Small {
    cmdstr.push("-s");
    cmdstr.push("320x240");
    cmdstr.push("-b:v");
    cmdstr.push("300k");
  } else {
    cmdstr.push("-s");
    cmdstr.push("640x480");
    cmdstr.push("-b:v");
    cmdstr.push("700k");
  }
  cmdstr.push("-bf");
  cmdstr.push("0");
  cmdstr.push("-");

  //let cmdstr = cmdstr.join(" ");

  // //let cmdstr = format!("-i {url} -f mpegts -codec:v mpeg1video -s 640x480 -b:v 800k -bf 0 -");
  // let cmdstr = if *resolution == CamResolution::Small {
  //   //format!("-i {url} -f mpegts -codec:v mpeg1video -s 640x480 -r 30 -b:v 300k -bf 0 -")
  //   //format!("-rtsp_transport tcp -i {url} -f mpegts -codec:v mpeg1video -s 320x240 -r 30 -b:v 300k -bf 0 -")

  //   if quiet {
  //     format!("-err_detect ignore_err -loglevel quiet -rtsp_transport tcp -i {url} -f mpegts -codec:v mpeg1video -s 320x240 -r 30 -b:v 300k -bf 0 -")
  //   } else {
  //     format!(
  //       "-err_detect ignore_err -rtsp_transport tcp -i {url} -f mpegts -codec:v mpeg1video -s 320x240 -r 30 -b:v 300k -bf 0 -"
  //     )
  //   }
  //   //format!("-i {url} -f mpegts -codec:v mpeg1video -s 320x240 -r 30 -b:v 300k -bf 0 -")
  // } else {
  //   //format!("-rtsp_transport tcp -i {url} -f mpegts -codec:v mpeg1video -s 640x480 -r 30 -b:v 700k -bf 0 -")
  //   if quiet {
  //     format!("-err_detect ignore_err -loglevel quiet -rtsp_transport tcp -i {url} -f mpegts -codec:v mpeg1video -s 640x480 -r 30 -b:v 700k -bf 0 -")
  //   } else {
  //     format!(
  //       "-err_detect ignore_err -rtsp_transport tcp -i {url} -f mpegts -codec:v mpeg1video -s 640x480 -r 30 -b:v 700k -bf 0 -"
  //     )
  //   }

  //   //format!("-i {url} -f mpegts -codec:v mpeg1video -s 640x480 -r 30 -b:v 700k -bf 0 -")
  // };

  let list = vec!["info", "verbose", "debug", "trace"];
  if list.iter().any(|x| *x == &log_level) {
    log::warn!("cmdstr is {}", cmdstr.join(" "));
  }

  cmd.stdout(Stdio::piped()).stdin(Stdio::piped()).args(cmdstr);
  //.args(cmdstr.split(" ").filter(|x| !x.is_empty()).collect::<Vec<&str>>());
  //info!("cmdstr is {:?}", cmdstr);

  return cmd;
}

async fn cmd_runner(ctx: Arc<Mutex<Vec<TxBin>>>, child_arc: Arc<Mutex<Box<ChildInfo>>>, seq: Option<i32>) {
  // child와, tx 목록을 유지하고 이를 이용해서 지속적인 전송 처리함 수행함.
  //let mut cmd = get_command();

  // 이 버퍼를 작게 한다고 해서 딜레이가 줄어드는 것은 아님.
  // 충분한 크기가 필요할 것으로 보임.
  let mut buf = [0; 102_400];
  let stdout = get_child_stdout(&child_arc).await;

  let mut checked = false;
  if stdout.is_none() {
    do_close_child(child_arc).await;
    return;
  }
  let mut stdout = stdout.unwrap();
  let mut tr_id = 0;
  loop {
    let dur = tokio::time::Duration::from_secs(13); // 13 초 동안은 대기해보는 것으로.
    let ret = tokio::time::timeout(dur, stdout.read(&mut buf)).await;
    if let Err(e) = ret {
      error!("read timeout {e:?}");
      if let Some(seq) = seq {
        crate::rtsp::stat_mgr::send_stat(seq, CamStat::Err).await;
      }
      break;
    }
    let ret = ret.unwrap();
    if let Err(e) = ret {
      error!("read error {e:?}");
      if let Some(seq) = seq {
        crate::rtsp::stat_mgr::send_stat(seq, CamStat::Err).await;
      }
      break;
    }
    let size = ret.unwrap();
    //log::debug!("read size is {size}");
    if size == 0 {
      error!("read size zero. ");
      if let Some(seq) = seq {
        crate::rtsp::stat_mgr::send_stat(seq, CamStat::Err).await;
      }
      break;
    }

    if !checked {
      checked = true;
      if let Some(seq) = seq {
        crate::rtsp::stat_mgr::send_stat(seq, CamStat::Ok).await;
      }
    }
    if let ControlFlow::Break(_) = do_broadcast_rtsp(&ctx, &buf, &mut tr_id, size).await {
      break;
    }
  }

  do_close_child(child_arc).await;
}

async fn do_broadcast_rtsp(
  ctx: &Arc<Mutex<Vec<tokio::sync::mpsc::Sender<BinInfo>>>>,
  buf: &[u8; 102400],
  tr_id: &mut usize,
  size: usize,
) -> ControlFlow<()> {
  let mut list = ctx.lock().await;
  let mut idxs: Vec<usize> = Vec::new();
  let bin = Box::new(buf[0..size].to_vec());
  *tr_id += 1;
  for (index, tx) in list.iter().enumerate() {
    match tx
      .send(BinInfo {
        tr_id: *tr_id,
        bin: bin.clone(),
      })
      .await
    {
      Ok(_) => {}
      Err(e) => {
        error!("error {:?}", e);
        idxs.push(index);
      }
    }
  }
  for idx in (&idxs).iter().rev() {
    info!("remove index {}", idx);
    list.remove(*idx);
  }
  // 라이프타임 범위 설정.
  //info!("send buf len is {}", size);
  if list.len() == 0 {
    error!("length is zero");
    return ControlFlow::Break(());
  }
  ControlFlow::Continue(())
}

async fn get_child_stdout(child_arc: &Arc<Mutex<Box<ChildInfo>>>) -> Option<ChildStdout> {
  let mut child = child_arc.lock().await;
  match &mut child.child {
    Some(child) => child.stdout.take(),
    None => None,
  }
}

async fn do_close_child(child_arc: Arc<Mutex<Box<ChildInfo>>>) {
  let mut child = child_arc.lock().await;
  match &mut child.child {
    Some(child) => match child.kill().await {
      Ok(_) => {
        error!("kill... ok..");
        let _ = child.wait().await;
      }
      Err(e) => error!("kill error e {:?}", e),
    },
    None => (),
  }
  error!("child none");
  child.child = None;
  child.exit = true;
}

async fn tx_handler(mut rxbin: RxBinBin, url: String, resolution: CamResolution, seq: Option<i32>) {
  let ctx: Arc<Mutex<Vec<TxBin>>> = Arc::new(Mutex::new(Vec::new()));
  let child_arc = Arc::new(Mutex::new(Box::new(ChildInfo {
    child: None,
    exit: false,
  })));

  let mut sleep = false;
  loop {
    if sleep {
      tokio::time::sleep(tokio::time::Duration::from_millis(1000)).await; // 대기기간을 줄이도록.
      sleep = false;
    }

    match rxbin.try_recv() {
      Ok(tx) => {
        let mut list = ctx.lock().await;
        list.push(tx);
        continue;
      }
      Err(e) => match e {
        TryRecvError::Empty => {}
        TryRecvError::Disconnected => {
          error!("disconnected e {:?}", e);
          break;
        }
      },
    }

    let list = ctx.lock().await;
    if list.len() == 0 {
      error!("length is zero"); // 없는 경우에도 계속해도 돌게 되어 있음.
                                // 실행중인 ffmpeg 닫을 것.
      let mut child = child_arc.lock().await;
      match &mut child.child {
        Some(_) => {
          error!("set child none");
          child.child = None;
          tokio::time::sleep(tokio::time::Duration::from_millis(1000)).await;
        }
        None => {}
      }
      return;
    }

    // 새로 spawn 한경우에는 sleep으로 대기할 것.
    // 실행중인지 체크하여,
    // 실행중인경우, 데이터 받아서 broad casting
    // 실행중이 아닌경우, 실행하고 broad casting
    sleep = true;

    let mut child = child_arc.lock().await;
    if child.exit {
      warn!("exit flag true");
      break;
    }
    if child.child.is_none() {
      let ctx = ctx.clone();
      let mut cmd = get_command(&url, &resolution);
      match cmd.spawn() {
        Ok(ok) => child.child = Some(ok),
        Err(e) => {
          error!("cmd spawn error {e:?}");
          return;
        }
      };

      let child_arc = child_arc.clone();
      tokio::spawn(async move {
        warn!("spawn cmd runner");
        cmd_runner(ctx, child_arc, seq.clone()).await;
      });
    }
  }
}

pub async fn main(mut rx_main: tokio::sync::mpsc::Receiver<CamInfo>) {
  // 카메라를 관리하는 모듈.
  // 쓰레드로 동작하며,
  // channel을 이용해서 커뮤니케이션 한다.
  _ = rx_main;
  //let mut ctx: HashMap<String, TxBinBin> = HashMap::new();
  let ctx: Arc<Mutex<HashMap<String, TxBinBin>>> = Arc::new(Mutex::new(HashMap::new()));

  loop {
    debug!("rxmain loop start");
    let ret = rx_main.recv().await;
    if let None = ret {
      error!("Error Receive ");
      break;
    }

    let cam_info = ret.unwrap();

    // 수신 처리.
    let mut map = ctx.lock().await;
    let txbin = map.get(&cam_info.path);
    info!("caminfo 1 {:?}", cam_info);

    if let None = txbin {
      // 새로운 채널과 쓰레드를 생성하고, 이를 ctx 에 저장함.
      let (tx, rx) = tokio::sync::mpsc::channel::<TxBin>(50);
      let _ = tx.send(cam_info.tx).await;

      let name = cam_info.path.clone();
      let url = cam_info.rtsp_url.clone();
      let resolution = cam_info.resolution;
      map.insert(cam_info.path, tx);

      let ctx = ctx.clone();
      tokio::spawn(async move {
        tx_handler(rx, url, resolution, cam_info.cam_seq.clone()).await;
        ctx.lock().await.remove(&name);
      });
      continue;
    }

    let txbin = txbin.unwrap();
    match txbin.send(cam_info.tx).await {
      Ok(_) => {
        // ok
        info!("send ok {}", cam_info.path);
      }
      Err(e) => {
        error!("e : {:?}", e);
      }
    }
  }
}
