// @flow
'use client';
import { useDrawerCameraList } from '@/app/(admin)/comp/drawer/DrawerCameraList';
import { MapOl } from '@/app/(admin)/comp/map/MapOl';
import ExpandView from '@/app/(admin)/comp/status/ExpandView';
import WorkCamera from '@/app/(admin)/comp/status/WorkCamera';
import Loading from '@/app/(admin)/comp/utils/Loading';
import { isCameraStat, useWsMsg } from '@/app/ws/useWsMsg';
import { IfTbCamera } from '@/models/tb_camera';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { Box, Collapse, IconButton } from '@mui/material';
import 'ol/ol.css';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

type Props = {};

const Index = (_props: Props) => {
  const { data: cameraList, mutate: mutateCameras } = useSWR<IfTbCamera[]>(['/api/camera/list']);
  const [refDrawer, DrawerCameraList] = useDrawerCameraList();
  const [expanded, setExpanded] = useState(false);

  useWsMsg((msg) => {
    if (isCameraStat(msg)) {
      mutateCameras();
    }
  });

  useEffect(() => {
    const loopTimeout = () => {
      if (refDrawer.current) {
        refDrawer.current.open();
      } else {
        setTimeout(() => {
          loopTimeout();
        }, 100);
      }
    };
    loopTimeout();
  }, [refDrawer]);

  const handleClickExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <>
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <DrawerCameraList />
        {cameraList ? (
          <>
            <Collapse in={expanded} timeout='auto' orientation='horizontal' unmountOnExit>
              <Box className='status-header' id='status-header'>
                <WorkCamera />
              </Box>
            </Collapse>
            <ExpandView expand={expanded} setExpand={handleClickExpand} />
            <MapOl devs={{ camera: cameraList ? cameraList : null }} />
            <IconButton
              sx={{ position: 'absolute', right: 5, top: 88 }}
              title='카메라 목록 표시'
              onClick={() => refDrawer.current?.open()}
            >
              <ChevronLeftIcon
                sx={{
                  color: '#fff',
                  backgroundColor: 'rgb(255, 111, 0)',
                  borderRadius: '50%',
                }}
              />
            </IconButton>
          </>
        ) : (
          <Box sx={{ margin: 'auto' }}>
            <Loading />
          </Box>
        )}
      </Box>
    </>
  );
};

export default Index;
