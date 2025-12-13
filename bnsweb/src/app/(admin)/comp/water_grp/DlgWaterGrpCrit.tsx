import { CdIdLabel } from '@/app/(admin)/comp/input/CdIdLabel';
import { DlgBase } from '@/app/(admin)/comp/popup/DlgBase';
import { DlgTitle } from '@/app/(admin)/comp/popup/DlgTitle';
import { useApiWaterGrpControl } from '@/app/(admin)/comp/water_grp/useApiWaterGrpControl';
import { WaterLevelBadge } from '@/app/(admin)/comp/water_grp/WaterLevelBadge';
import { SettingBtn } from '@/app/(admin)/settings/alm/SettingBtn';
import { StyledCardActions } from '@/app/(admin)/settings/comp/StyledForm';
import { useWaterOne } from '@/hooks/useDevList';
import { useInterval } from '@/hooks/useInterval';
import { usePromise } from '@/hooks/usePromise';
import { useRefComponent } from '@/hooks/useRefComponent';
import { useMapOl } from '@/store/mapStore';
import { mapmove } from '@/utils/map-move';
import * as waterutils from '@/utils/water-utils';
import { Box, DialogContent, Typography } from '@mui/material';
import 'ol/ol.css';
import * as React from 'react';
import { useEffect, useState } from 'react';

export type IfWaterGrpCrit = {};

export type IfDlgWaterGrpCrit = {
  show: (props: { waterGrpId: string }) => Promise<IfWaterGrpCrit>;
  close: () => void;
  stopTimer: () => void;
};

export const DlgWaterGrpCrit = React.forwardRef<IfDlgWaterGrpCrit, unknown>((props, ref) => {
  const [open, setOpen] = React.useState(false);
  const promise = usePromise<IfWaterGrpCrit, { cmd: string; msg?: string }>();
  const [waterGrpId, setWaterGrpId] = useState('');
  const map = useMapOl();
  const [closeTime, setCloseTime] = useState(new Date());

  const { data: water1 } = useWaterOne(Number(waterGrpId.split(',')[0]));
  const { data: water2 } = useWaterOne(Number(waterGrpId.split(',')[1]));

  const { apiControlDown, apiControlStop, apiControlAutodown, apiControlClose } =
    useApiWaterGrpControl();

  const [requestAutodown, setRequestAutodown] = useState(false);

  useEffect(() => {
    if (map) {
      if (!water1?.water_lng || !water1?.water_lat || !water2?.water_lng || !water2?.water_lat)
        return;
      const points = [
        { lng: water1?.water_lng, lat: water1?.water_lat },
        { lng: water2?.water_lng, lat: water2?.water_lat },
      ];
      console.log('points', points);
      mapmove.extent(map, points);
    }
  }, [map, water1, water2]);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    clear();
    setRemainSec(undefined);
    setOpen(false);
    apiControlClose(waterGrpId, () => {
      promise.current.reject?.({ cmd: 'close' });
    });
  };

  React.useImperativeHandle<IfDlgWaterGrpCrit, IfDlgWaterGrpCrit>(
    ref,
    (): IfDlgWaterGrpCrit => ({
      show: (props: { waterGrpId: string }) => {
        return new Promise((resolve, reject) => {
          promise.current = { resolve, reject };
          setWaterGrpId(props.waterGrpId);
          console.log('waterGrpId', waterGrpId);
          setCloseTime(new Date(new Date().getTime() + 60 * 1000));
          setRemainSec(60);
          setRequestAutodown(false);
          restart();
          handleClickOpen();
        });
      },
      close: () => {
        handleClose();
      },
      stopTimer: () => {
        clear();
      },
    })
  );

  const handleDown = () => {
    console.log('handleDown');
    apiControlDown(waterGrpId);
  };
  const handleStop = () => {
    console.log('handleStop');
    apiControlStop(waterGrpId);
  };

  const handleAutodown = () => {
    console.log('handleStop');
    apiControlAutodown(waterGrpId);
    setRequestAutodown(true);
  };
  const getRemainSec = (): number => {
    // showTime에  secs(초) 만큼 더한 시간을 반환하는 함수입니다.
    // 예시: showTime이 현재 시간이고 secs가 10이면, 10초 뒤의 Date 객체를 반환합니다.
    const remainSec = Math.floor((closeTime.getTime() - new Date().getTime()) / 1000);
    if (remainSec < 0) return 0;
    return remainSec;
  };
  const [remainSec, setRemainSec] = useState<number | undefined>(undefined);

  const { restart, clear } = useInterval(1000, false, () => {
    console.log('useInterval');
    const remainSec = getRemainSec();
    setRemainSec(remainSec);
    if (remainSec <= 0) {
      clear();
      handleAutodown();
    }
  });

  return (
    <React.Fragment>
      <DlgBase
        //onClose={handleClose}
        onClose={() => {
          //handleClose();
        }}
        open={open}
        maxWidth={false}
        closeAfterTransition={false}
        width={450}
      >
        <DlgTitle title={'수위계 그룹 심각'} handleClose={handleClose} />

        <DialogContent dividers>
          <Box className='flex flex-col gap-1 flex-wrap'>
            <Box className='flex flex-row gap-1'>
              <Typography>{water1?.water_nm}</Typography>
              <Box className='flex-1' />
              <WaterLevelBadge
                sx={{ background: `${waterutils.waterLevelColor(water1?.water_stat)}` }}
              >
                {water1?.water_level}
              </WaterLevelBadge>
              <CdIdLabel grp='CS' id={water1?.comm_stat ?? ''} isStat />
            </Box>
            <Box className='flex flex-row gap-1 '>
              <Typography>{water2?.water_nm}</Typography>
              <Box className='flex-1' />
              <WaterLevelBadge
                sx={{ background: `${waterutils.waterLevelColor(water2?.water_stat)}` }}
              >
                {water2?.water_level}
              </WaterLevelBadge>
              <CdIdLabel grp='CS' id={water2?.comm_stat ?? ''} isStat />
            </Box>

            <Box className='mt-5 text-xl text-center text-red-500 font-bold'>
              {requestAutodown
                ? '자동 차단을 요청 하였습니다.'
                : `${remainSec} 초 이내 처리하지 않으면 자동 차단을 진행합니다.`}
            </Box>
          </Box>
        </DialogContent>

        <StyledCardActions>
          <SettingBtn autoFocus onClick={handleDown} btnType='down'>
            하강
          </SettingBtn>
          <SettingBtn autoFocus onClick={handleStop} btnType='stop'>
            정지
          </SettingBtn>
          <SettingBtn autoFocus onClick={handleClose} btnType='close'>
            닫기
          </SettingBtn>
        </StyledCardActions>
      </DlgBase>
    </React.Fragment>
  );
});

DlgWaterGrpCrit.displayName = 'DlgWaterGrpCrit';
export const useDlgWaterGrpCrit = () => useRefComponent<IfDlgWaterGrpCrit>(DlgWaterGrpCrit);
