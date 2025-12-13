use crate::{entities::tb_login, AppState};
use actix_session::Session as WebSession;
use actix_web::{rt, web, Error, HttpRequest, HttpResponse};
use actix_ws::{AggregatedMessage, AggregatedMessageStream, ProtocolError};
use futures_util::StreamExt as _;
use log::{debug, error, warn};
use tokio::sync::broadcast::{self, error::RecvError};

pub async fn wsevent(
  sess: WebSession,
  req: HttpRequest,
  app: web::Data<AppState>,
  stream: web::Payload,
) -> Result<HttpResponse, Error> {
  debug!("echo process...");

  let user = sess.get::<tb_login::Model>("login").unwrap();
  debug!("login: {user:?}"); // 로그인된 user 정보를 가져옴.

  let rx = app.tx_ws.subscribe();

  let (res, session, stream) = actix_ws::handle(&req, stream)?;

  let stream = stream
    .aggregate_continuations()
    // aggregate continuation frames up to 1MiB
    .max_continuation_size(2_usize.pow(20));
  rt::spawn(wsloop(rx, session, stream));
  Ok(res)
}

async fn handle_rx_msg(
  msg: &Result<Box<String>, RecvError>,
  session: &mut actix_ws::Session,
) -> Result<(), Box<dyn std::error::Error>> {
  match msg {
    Ok(msg) => {
      match session.text(bytestring::ByteString::from(msg.as_str()).clone()).await {
        Ok(_ok) => {}
        Err(e) => {
          // 전송실패 오류임.
          let emsg = format!("ws send fail {e:?}");
          error!("{emsg}");
          return Err(emsg.into());
        }
      }
    }
    Err(e) => {
      let msg = format!("ws receive 오류 {e:?}");
      error!("{msg}");
      return Err(msg.into());
    }
  }

  Ok(())
}

async fn handle_ws_recv<'a>(
  msg: Result<AggregatedMessage, ProtocolError>,
  session: &mut actix_ws::Session,
) -> Result<(), Box<dyn std::error::Error>> {
  match msg {
    Ok(AggregatedMessage::Text(text)) => {
      // echo text message
      debug!("echo message {}", text);
      session.text(text).await.unwrap();
      //session.close(CloseCode::Abnormal)
    }

    Ok(AggregatedMessage::Binary(bin)) => {
      // echo binary message
      debug!("echo bin {:?}", bin);
      session.binary(bin).await.unwrap();
    }

    Ok(AggregatedMessage::Ping(msg)) => {
      // respond to PING frame with PONG frame
      debug!("echo ping {:?}", msg);
      session.pong(&msg).await.unwrap();
    }
    Ok(AggregatedMessage::Pong(msg)) => {
      //
      debug!("echo pinpong  {:?}", msg);
    }
    Ok(AggregatedMessage::Close(reason)) => {
      let emsg = format!("close {reason:?}");
      error!("{emsg}");
      return Err(emsg.into());
    }
    Err(e) => {
      let emsg = format!("etc message receive {e:?}");
      error!("{emsg}");
      return Err(emsg.into());
    }
  }
  Ok(())
}

async fn wsloop(mut rx: broadcast::Receiver<Box<String>>, mut session: actix_ws::Session, mut stream: AggregatedMessageStream) {
  loop {
    tokio::select! {
      msg = rx.recv() =>{
        let r = handle_rx_msg(&msg, &mut session).await;
        if let Err(e) = r {
          error!("{e}");
          break;
        }
      }
      Some(msg) = stream.next() => {
        if let Err(e) = handle_ws_recv(msg, &mut session).await{
          error!("{e}");
          break;
        }
      }
    }
  }

  warn!("end of loop .. ");
}
