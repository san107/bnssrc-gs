// @flow
'use client';
import { MapOl } from '@/app/(admin)/comp/map/MapOl';
import StatWater from '@/app/(admin)/comp/status/StatWater';
import WorkWater from '@/app/(admin)/comp/status/WorkWater';
import Loading from '@/app/(admin)/comp/utils/Loading';
import { isWaterEvt, isWaterStat, useWsMsg } from '@/app/ws/useWsMsg';
import { IfTbWater } from '@/models/water/tb_water';
import { Box, Collapse } from '@mui/material';
import useSWR from 'swr';
import ExpandView from '@/app/(admin)/comp/status/ExpandView';
import { useState } from 'react';

type Props = {};
const Index = (_props: Props) => {
  const { data: waterList, mutate: mutateWaters } = useSWR<IfTbWater[]>(['/api/water/list']);
  const [expanded, setExpanded] = useState(false);

  useWsMsg((msg) => {
    if (isWaterEvt(msg)) {
      mutateWaters();
    } else if (isWaterStat(msg)) {
      mutateWaters();
    }
  });

  const handleClickExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <>
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {waterList ? (
          <>
            <Collapse in={expanded} timeout='auto' orientation='horizontal' unmountOnExit>
              <Box className='status-header' id='status-header'>
                <StatWater />
                <WorkWater />
              </Box>
            </Collapse>
            <ExpandView expand={expanded} setExpand={handleClickExpand} />
            <MapOl devs={{ water: waterList ? waterList : null }} />
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
