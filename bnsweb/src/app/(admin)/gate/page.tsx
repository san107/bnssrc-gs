// @flow
'use client';
import { useDrawerGateList } from '@/app/(admin)/comp/drawer/DrawerGateList';
import { MapOl } from '@/app/(admin)/comp/map/MapOl';
import StatGate from '@/app/(admin)/comp/status/StatGate';
import WorkGate from '@/app/(admin)/comp/status/WorkGate';
import Loading from '@/app/(admin)/comp/utils/Loading';
import { isGateStat, useWsMsg } from '@/app/ws/useWsMsg';
import { IfTbGate } from '@/models/gate/tb_gate';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { Box, Collapse, IconButton } from '@mui/material';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import ExpandView from '@/app/(admin)/comp/status/ExpandView';

type Props = {};
const Index = ({}: Props) => {
  const { data: gateList, mutate: mutateGates } = useSWR<IfTbGate[]>(['/api/gate/list']);
  const [refDrawer, DrawerGateList] = useDrawerGateList();
  const [expanded, setExpanded] = useState(false);

  useWsMsg((msg) => {
    if (isGateStat(msg)) {
      mutateGates();
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
        <DrawerGateList />
        {gateList ? (
          <>
            <Collapse in={expanded} timeout='auto' orientation='horizontal' unmountOnExit>
              <Box className='status-header' id='status-header'>
                <StatGate />
                <WorkGate />
              </Box>
            </Collapse>
            <ExpandView expand={expanded} setExpand={handleClickExpand} />
            <MapOl devs={{ gate: gateList ? gateList : null }} />
            <IconButton
              sx={{ position: 'absolute', right: 5, top: 88 }}
              title='차단장비 목록 표시'
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
