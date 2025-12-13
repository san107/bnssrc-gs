import React, { useState } from 'react';
import { Box } from '@mui/material';
import Grid from '@mui/material/Grid';
import useSWR from 'swr';
import { CameraViewer } from '@/app/(admin)/comp/display/CameraViewer';
import { IfTbCamera } from '@/models/tb_camera';
import CamZoomInView from '@/app/(admin)/comp/display/CamZoomInView';
import axios from 'axios';

type Props = {
  gate_seq?: number;
  cameras?: IfTbCamera[];
};

const videoW = 200;
const videoH = 150;

const CamThumbView = ({ gate_seq, cameras }: Props) => {
  const { data: camList } = useSWR<IfTbCamera[]>(
    gate_seq ? `/api/gate_camera/camlist?gateSeq=${gate_seq}` : null,
    (url) => axios.get(url).then((res) => res.data)
  );
  const [selCam, setSelCam] = useState<number>(0);
  const [showZoomIn, setShowZoomIn] = useState(false);

  const handleClickZoomIn = (cam_seq: number) => {
    setSelCam(cam_seq);
    // const notification = document.getElementById('camera-zoomin-container');
    // if (notification) notification?.classList.add('show');
    // 클래스로 show, hide 하는 경우, JSMPEG Player가 열린 상태로 종료되지 않는 현상이 있어, show/hide 를 변수로 관리함.
    setShowZoomIn(true);
  };

  return (
    <Box className='camera-list'>
      <CamZoomInView cam_seq={selCam} show={showZoomIn} setShow={setShowZoomIn} />
      <Box
        sx={{
          height: videoH + 48,
          borderRadius: 2,
          bgcolor: '#161616',
          padding: '10px 10px 10px 10px',
        }}
      >
        <Grid container spacing={1}>
          {(camList || cameras || []).map((row) => (
            <Grid
              size={4}
              key={row?.cam_seq}
              width={videoW}
              onClick={() => handleClickZoomIn(row?.cam_seq || 0)}
            >
              <Box className='video'>
                <Box className='imgbox'>
                  <CameraViewer cam_seq={row?.cam_seq} minHeight={videoH} />
                </Box>
              </Box>
              <Box className='label'>{row?.cam_nm}</Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default CamThumbView;
