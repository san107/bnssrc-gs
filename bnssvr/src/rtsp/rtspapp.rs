//use socket2::{Domain, Socket, Type}; - socket2 는 충돌이 발생하여, 먹통현상 있으므로, 사용하지 말것.
use super::cam_mgr::{self, BinInfo};
use crate::{
  rtsp::{cam_mgr::CamResolution, stat_mgr::CamStat},
  svc,
};
use futures::{stream::FusedStream, SinkExt, TryStreamExt};
use lazy_static::lazy_static;
use log::{debug, error, info, warn};
use sea_orm::{DatabaseConnection, DbConn};
use std::{
  collections::{HashMap, LinkedList},
  env,
  net::SocketAddr,
  sync::Arc,
};
use tokio::{
  net::{TcpListener, TcpStream},
  sync::{mpsc::Receiver, Mutex},
};
use tokio_tungstenite::{
  accept_hdr_async_with_config,
  tungstenite::{
    handshake::server::Request,
    protocol::{Message, WebSocketConfig},
    Error,
  },
  WebSocketStream,
};

pub async fn main(conn: DbConn) {
  info!("main rtsp app");

  let wsport = env::var("WS_PORT")
    .expect("WS_PORT 를 설정하여 주십시오 3012")
    .parse::<u16>()
    .expect("WS_PORT 를 설정하여 주십시오 3012");
  log::info!("WS_PORT(JSMPEG) is {wsport}");
  let addr = format!("0.0.0.0:{wsport:?}").to_string();
  let addr: SocketAddr = addr.parse().expect("Invalid address");
  let listener = TcpListener::bind(&addr).await.expect("Failed to bind");
  let (tx_main, rx_main) = tokio::sync::mpsc::channel::<cam_mgr::CamInfo>(50);

  // 실제 RTSP 스트림 뽑아내는 곳.
  tokio::spawn(cam_mgr::main(rx_main));

  debug!("start ws listener");
  while let Ok((stream, _)) = listener.accept().await {
    let tx_main = tx_main.clone();
    info!("ws accept");
    let conn = conn.clone();

    tokio::spawn(handle_connection(stream, tx_main, conn));
    //debug!("ws accept end");
  }
}

lazy_static! {
  static ref DELAY: Arc<Mutex<HashMap<String, (u64, chrono::DateTime<chrono::Local>)>>> = Arc::from(Mutex::from(HashMap::new()));
}

async fn handle_connection(stream: TcpStream, tx_main: tokio::sync::mpsc::Sender<cam_mgr::CamInfo>, conn: DatabaseConnection) {
  info!("start handle_connection");

  // 이 값에 따라서, delay가 발생하기도 하고, 발생하지 않기도 함.
  // 버퍼가 찼을 때, clear하는 처리가 되어 있기 때문에, 이렇게 처리해도 문제 없을 듯.
  // jsmpeg에서, videoBufferSize: 100*1024 로 조정했을 때, 가장 큰 효과가 있었음.
  // 전송하는 해상도에 따라서 실시간성을 확보하고 싶다면, 적절하게 조절할 필요가 있음.
  // 해상도가 작을 경우, 버퍼 사이즈도 동일하게 조절이 필요함.
  let mut uri = None;
  let mut conf = WebSocketConfig::default();
  // conf.max_write_buffer_size = 50_000;
  // conf.write_buffer_size = 25_000;
  conf.max_write_buffer_size = 1024_000;
  conf.write_buffer_size = 512_000;

  //debug!("before accept");
  let mut ws_stream = accept_hdr_async_with_config(
    stream,
    |req: &Request, res| {
      uri = Some(req.uri().clone());
      Ok(res)
    },
    Some(conf),
  )
  .await
  .unwrap();
  let uri = uri.unwrap();

  let path = uri.path();
  info!("rtsp uri is {}", uri); // 요청한 URI 가져올 수 있음
  let name = if path.starts_with("/L") { &path[2..] } else { &path[1..] };

  let resolution = if path.starts_with("/L") {
    CamResolution::Large
  } else {
    CamResolution::Small
  };

  let seq = name.parse::<i32>().unwrap();
  //debug!("rtsp camera seq is {seq}");
  let ret = svc::camera::svc_camera::qry::Qry::find_by_id(&conn, seq).await;
  if let Err(e) = ret {
    log::error!("error find camera seq {seq} {e:?} uri is {uri}");
    crate::rtsp::stat_mgr::send_stat(seq, CamStat::Err).await;
    close_ws_stream(&mut ws_stream, path).await;
    return;
  }
  let ret = ret.unwrap();
  if let None = ret {
    log::error!("error not found camera seq {seq} uri is {uri}");
    crate::rtsp::stat_mgr::send_stat(seq, CamStat::Err).await;
    close_ws_stream(&mut ws_stream, path).await;
    return;
  }
  let ret = ret.unwrap();

  //debug!("rtsp camera model is {ret:?}");
  //info!("rtsp wsconfig : {:?}", ws_stream.get_config().clone());

  let (tx, mut rx) = tokio::sync::mpsc::channel::<cam_mgr::BinInfo>(50);

  let cam_path = if resolution == CamResolution::Small {
    ret.cam_path_s
  } else {
    ret.cam_path_l
  };
  let rtsp_url = format!(
    "rtsp://{}:{}@{}:{}{}{}",
    ret.cam_user_id,
    ret.cam_pass,
    ret.cam_ip,
    ret.cam_port,
    if cam_path.starts_with("/") { "" } else { "/" },
    cam_path
  );

  log::info!("rtsp_url is {rtsp_url}");
  let _ = tx_main
    .send(cam_mgr::CamInfo {
      path: path.to_owned(),
      rtsp_url,
      resolution,
      tx: tx.clone(),
      cam_seq: Some(seq),
    })
    .await;

  //info!("mainloop");
  let mut buflist: LinkedList<cam_mgr::BinInfo> = LinkedList::new();

  let secs = get_timeout_secs(path).await;

  let mut interval = tokio::time::interval(tokio::time::Duration::from_secs(secs));
  let mut recvok = false;

  let buffering = crate::util::get_env_bool("FFMPEG_BUFFERRING", false);

  loop {
    interval.reset();

    tokio::select! {
      _ = interval.tick() =>{
        do_rx_timeout(path, secs).await;

        break;
      },
      try_next = ws_stream.try_next() =>{
        do_ws_msg(try_next); // 웹소켓 메시지를 받으면 에러로 인식.
        break;
      },
      ret = rx.recv() =>{
        if ret.is_none() {
          error!("Error Receive None");
          break;
        };
        let ret = ret.unwrap();
        buflist.push_back(ret);
        if ! recvok{
          recvok = true;
        }
        if buffering{
          do_rx_recv_loop(&mut buflist, &mut rx);
          if buflist.len() >= 10 {
            warn!("buflist is over len {}", buflist.len());
            buflist.clear();
            continue;
          }
        }
        let  err = do_send_loop(&mut buflist, &mut ws_stream).await;
        if err {
          break;
        }
      }
    }
  }
  if !ws_stream.is_terminated() {
    match ws_stream.close(None).await {
      Ok(_) => {
        log::debug!("ws_stream close ok");
      }
      Err(e) => {
        log::error!("ws_stream close Err {e:?}");
      }
    }
  }
  if recvok {
    let mut map = DELAY.lock().await;
    map.remove(path);
  }

  log::warn!("exit handle_connection");
}

async fn do_rx_timeout(path: &str, secs: u64) {
  let mut map = DELAY.lock().await;
  let now = chrono::Local::now();
  map.insert(path.to_owned(), (secs, now));
  log::error!("timeout {secs} secs : no rtsp data");
}

fn do_rx_recv_loop(buflist: &mut LinkedList<BinInfo>, rx: &mut Receiver<BinInfo>) {
  loop {
    match rx.try_recv() {
      Ok(r) => buflist.push_back(r),
      Err(_) => break, // 버퍼에 없으면 다음 시작.
    }
  }
}

async fn do_send_loop(buflist: &mut LinkedList<BinInfo>, ws_stream: &mut WebSocketStream<TcpStream>) -> bool {
  let mut err = false;
  loop {
    let ret = buflist.pop_front();
    if ret.is_none() {
      break;
    }
    let ret = ret.unwrap();
    if let Err(e) = ws_stream.send(Message::binary(*ret.bin)).await {
      error!("Error sending message: {}", e);
      err = true;
      break;
    };
  }

  err
}

fn do_ws_msg(try_next: Result<Option<Message>, Error>) {
  match try_next {
    Ok(Some(msg)) => {
      debug!("message is {msg:?}");
      match msg {
        Message::Close(_) => {
          error!("close called...");
          return;
        }
        _ => {
          error!("other message 확인용");
          return;
        }
      }
    }
    Ok(None) => {
      error!("message is none ");
      return;
    }
    Err(e) => {
      error!("error : {e:?}");
      return;
    }
  }
}

async fn get_timeout_secs(path: &str) -> u64 {
  let mut secs = 15u64;
  // 기본 대기 시간
  let start = secs - 1;
  let limit = 120u64;
  let maxgap = 30;

  {
    let map = DELAY.lock().await;
    if let Some(s) = map.get(path) {
      let now = chrono::Local::now();
      let diff = now - s.1;
      // 15초 이내에 재요청이 들어오는 경우에만 처리함.
      // 15초 이상이 걸리는 경우에는, 초기값을 적용함.
      if diff.num_seconds() < 15 {
        if s.0 >= limit {
          secs = s.0;
        } else {
          let mut gap = (s.0 - start) * 2;
          if gap > maxgap {
            gap = maxgap;
          }
          secs = s.0 + gap;
          if secs > limit {
            secs = limit;
          }
        }
      }
    }
  }
  secs
}

async fn close_ws_stream(ws_stream: &mut tokio_tungstenite::WebSocketStream<TcpStream>, path: &str) {
  if !ws_stream.is_terminated() {
    match ws_stream.close(None).await {
      Ok(_) => {
        log::debug!("ws_stream close ok");
      }
      Err(e) => {
        log::error!("ws_stream close Err {e:?}");
      }
    }
  }
  let mut map = DELAY.lock().await;
  map.remove(path);
  log::warn!("exit handle_connection");
}
