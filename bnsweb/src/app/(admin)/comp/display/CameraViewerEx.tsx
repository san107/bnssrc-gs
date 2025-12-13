'use client';

import * as React from 'react';
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { useMounted } from '@/hooks/useMounted';
import { useScriptJSMpeg } from '@/hooks/useScript';
import { IfTbCamera, TbCamera } from '@/models/tb_camera';
import { Box, styled, IconButton } from '@mui/material';
import axios from 'axios';
import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { getDynamicPort } from '@/utils/host-util';
import { useSysConf } from '@/store/useSysConf';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import VideocamIcon from '@mui/icons-material/Videocam';

type Props = {
  cam_seq?: number | null;
  width?: number | string;
  minHeight?: number;
  small?: boolean;
  title?: string;
  enabled?: boolean;
};
declare const JSMpeg: any;

const ctx = {
  playerCnt: 0,
  inc: () => (ctx.playerCnt = ctx.playerCnt + 1),
  dec: () => (ctx.playerCnt = ctx.playerCnt - 1),
  islimit: () => ctx.playerCnt > 7,
};

export const CameraViewerEx = ({
  cam_seq,
  width,
  minHeight,
  small = true,
  title,
  enabled = true,
}: Props) => {
  //const doneScript = useScript('/scripts/jsmpeg.min.js', 'jsmpeg.min.js');
  const doneScript = useScriptJSMpeg();
  const refCanvas = useRef<HTMLDivElement>(null);
  const mounted = useMounted();
  const [data, setData] = React.useState<IfTbCamera>(new TbCamera());
  const [hide, setHide] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(enabled);
  const { sysConf } = useSysConf();

  // enabled props 가 변경되면 내부 상태도 동기화
  useEffect(() => {
    setIsCameraOn(enabled);
  }, [enabled]);

  useEffect(() => {
    if (!cam_seq) {
      setData(new TbCamera());
      return;
    }
    axios
      .get(`/api/camera/one?camSeq=${cam_seq}`)
      .then((res) => {
        setData(res.data);
      })
      .catch((_err) => {
        setData(new TbCamera());
      });
  }, [cam_seq]);

  useEffect(() => {
    if (!doneScript || !mounted || !data?.cam_ip || !isCameraOn) {
      setHide(false);
      return;
    }

    const getIpPort = () => {
      const wsport = getDynamicPort(Number(process.env.NEXT_PUBLIC_WS_PORT));
      const host = process.env.NEXT_PUBLIC_MY_PC
        ? 'bisangsoft.iptime.org'
        : document.location.hostname;
      return host + ':' + wsport;
    };

    const getRtspUrl = () => {
      // const wsport = getDynamicPort(Number(process.env.NEXT_PUBLIC_WS_PORT));
      // const host = process.env.NEXT_PUBLIC_MY_PC
      //   ? 'bisangsoft.iptime.org'
      //   : document.location.hostname;
      // const host = document.location.hostname;
      const prepath = small ? '/' : '/L';

      const hostport = sysConf.use_rtsp_svr_yn === 'Y' ? sysConf.rtsp_svr_ip_port : getIpPort();

      const url = 'ws://' + hostport + prepath + data.cam_seq; // 고해상도는 /L로 처리하면 됨.
      return url;
    };

    const parent = refCanvas.current;
    const canvas = document.createElement('canvas');
    //canvas.setAttribute('id', 'canvasID');
    canvas.style.width = '100%';
    parent?.appendChild(canvas);

    const url = getRtspUrl();
    console.log('cam_url', url);
    setHide(false);
    ctx.inc();
    const player = new JSMpeg.Player(url, {
      canvas: canvas,
      disableGl: ctx.islimit() ? true : false,
      onPlay: (_play) => {
        setHide(true);
      },
    });
    //setPlayer(player);

    return () => {
      player.destroy();
      parent?.removeChild(canvas);
      ctx.dec();
    };
  }, [
    mounted,
    doneScript,
    data?.cam_seq,
    data?.cam_ip,
    small,
    isCameraOn,
    sysConf.use_rtsp_svr_yn,
    sysConf.rtsp_svr_ip_port,
  ]);

  const handleCameraToggle = () => {
    setIsCameraOn(!isCameraOn);
  };

  return (
    <div style={{ position: 'relative', width, minHeight }} ref={refCanvas}>
      <div
        css={css`
          &.play:after {
            width: 100%;
            height: 100%;
            content: ' ';
            background-color: #2e3239;
            background-image: url(/images/video_clip.png);
            background-repeat: no-repeat;
            background-position: center center;
            left: 0;
            top: 0;
            // border: 1px solid blue;
            position: absolute;
          }
        `}
        className={clsx({ play: !hide })}
      >
        {/* <canvas id='canvasId' style={{ width: '100%', height: 640 }}></canvas> */}
      </div>

      <Box
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 2,
        }}
      >
        <IconButton
          onClick={handleCameraToggle}
          sx={{
            backgroundColor: 'rgba(63, 35, 35, 0.6)',
            color: isCameraOn ? '#4caf50' : '#ff4444',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
            },
            width: 36,
            height: 36,
          }}
        >
          {isCameraOn ? <VideocamIcon /> : <VideocamOffIcon />}
        </IconButton>
      </Box>

      {!isCameraOn && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            borderRadius: 1,
            zIndex: 1,
          }}
        >
          {/* <VideocamOffIcon sx={{ fontSize: 64, color: '#ff4444', mb: 2 }} /> */}
          <Box
            sx={{
              color: '#cccccc',
              fontSize: '12px',
              mt: 1,
              textAlign: 'center',
            }}
          >
            카메라가 꺼졌습니다.
          </Box>
        </Box>
      )}

      {title && <Title>{title}</Title>}
    </div>
  );
};

const Title = styled(Box)`
  width: 100%;
  color: white;
  position: absolute;
  text-align: center;
  text-shadow: 1px 1px 2px black, -1px -1px 2px black;
`;
