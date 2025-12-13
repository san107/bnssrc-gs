use crate::entities::tb_login;
use actix_session::Session;
use actix_web::{rt, web, Error, HttpRequest, HttpResponse};
use actix_ws::AggregatedMessage;
use futures_util::StreamExt as _;
use log::{debug, error, warn};

pub async fn echo(sess: Session, req: HttpRequest, stream: web::Payload) -> Result<HttpResponse, Error> {
  debug!("echo process...");
  //   let a = svc_cd::qry::Qry::find_all(&app.conn).await;
  //   if let Ok(list) = a {
  //     list.iter().for_each(|e| debug!("{e:?}"));
  //   }
  let user = sess.get::<tb_login::Model>("login").unwrap();
  debug!("login: {user:?}"); // 로그인된 user 정보를 가져옴.

  let (res, mut session, stream) = actix_ws::handle(&req, stream)?;

  let mut stream = stream
    .aggregate_continuations()
    // aggregate continuation frames up to 1MiB
    .max_continuation_size(2_usize.pow(20));

  // start task but don't wait for it
  rt::spawn(async move {
    // receive messages from websocket
    while let Some(msg) = stream.next().await {
      match msg {
        Ok(AggregatedMessage::Text(text)) => {
          // echo text message
          debug!("echo message {}", text);
          session.text(text).await.unwrap();
          break;
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
          error!("close {reason:?}");
          break;
        }

        Err(e) => {
          error!("etc message receive {e:?}");
          break;
        }
      }
    }
    warn!("end of loop .. ");
  });

  // respond immediately with response connected to WS session
  Ok(res)
}
