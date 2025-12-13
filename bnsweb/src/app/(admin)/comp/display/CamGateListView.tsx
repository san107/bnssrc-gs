import React, { useState } from 'react';
import { Box } from '@mui/material';
import { CameraViewer } from '@/app/(admin)/comp/display/CameraViewer';
import { IfTbGate } from '@/models/gate/tb_gate';
import Grid from '@mui/material/Grid';
import CamZoomInView from '@/app/(admin)/comp/display/CamZoomInView';

type Props = {
  gate_seq?: number;
  gateList?: IfTbGate[];
};

const videoW = 200;
const videoH = 150;

const CamGateListView = ({ gateList }: Props) => {
  const [selCam, setSelCam] = useState<number>(0);

  const handleClickZoomIn = (cam_seq: number) => {
    setSelCam(cam_seq);
    // const notification = document.getElementById('camera-zoomin-container');
    // if (notification) notification?.classList.add('show');
    // 클래스로 show, hide 하는 경우, JSMPEG Player가 열린 상태로 종료되지 않는 현상이 있어, show/hide 를 변수로 관리함.
    setShowZoomIn(true);
  };

  const [showZoomIn, setShowZoomIn] = useState(false);

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
          {(gateList || []).map((row) => (
            <Grid
              size={4}
              key={row?.gate_seq}
              width={videoW}
              onClick={() => handleClickZoomIn(row?.cam_seq || 0)}
            >
              <Box className='video'>
                <Box className='imgbox'>
                  <CameraViewer cam_seq={row?.cam_seq} minHeight={videoH} />
                </Box>
              </Box>
              <Box className='label'>{row?.gate_nm}</Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default CamGateListView;
