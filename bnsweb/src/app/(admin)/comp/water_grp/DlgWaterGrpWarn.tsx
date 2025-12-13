import { CdIdLabel } from '@/app/(admin)/comp/input/CdIdLabel';
import { DlgBase } from '@/app/(admin)/comp/popup/DlgBase';
import { DlgTitle } from '@/app/(admin)/comp/popup/DlgTitle';
import { WaterLevelBadge } from '@/app/(admin)/comp/water_grp/WaterLevelBadge';
import { SettingBtn } from '@/app/(admin)/settings/alm/SettingBtn';
import { useWaterOne } from '@/hooks/useDevList';
import { usePromise } from '@/hooks/usePromise';
import { useRefComponent } from '@/hooks/useRefComponent';
import { useMapOl } from '@/store/mapStore';
import { mapmove } from '@/utils/map-move';
import { Box, DialogContent, Typography } from '@mui/material';
import DialogActions from '@mui/material/DialogActions';
import 'ol/ol.css';
import * as React from 'react';
import { useEffect, useState } from 'react';
import * as waterutils from '@/utils/water-utils';

export type IfWaterGrpWarn = {};

export type IfDlgWaterGrpWarn = {
  show: (props: { waterGrpId: string }) => Promise<IfWaterGrpWarn>;
  close: () => void;
};

export const DlgWaterGrpWarn = React.forwardRef<IfDlgWaterGrpWarn, unknown>((props, ref) => {
  const [open, setOpen] = React.useState(false);
  const promise = usePromise<IfWaterGrpWarn, { cmd: string; msg?: string }>();
  const [waterGrpId, setWaterGrpId] = useState('');
  const map = useMapOl();

  const { data: water1 } = useWaterOne(Number(waterGrpId.split(',')[0]));
  const { data: water2 } = useWaterOne(Number(waterGrpId.split(',')[1]));

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
    setOpen(false);
    promise.current.reject?.({ cmd: 'close' });
  };

  React.useImperativeHandle<IfDlgWaterGrpWarn, IfDlgWaterGrpWarn>(
    ref,
    (): IfDlgWaterGrpWarn => ({
      show: (props: { waterGrpId: string }) => {
        return new Promise((resolve, reject) => {
          promise.current = { resolve, reject };
          setWaterGrpId(props.waterGrpId);
          console.log('waterGrpId', waterGrpId);
          handleClickOpen();
        });
      },
      close: () => {
        handleClose();
      },
    })
  );

  return (
    <React.Fragment>
      <DlgBase onClose={handleClose} open={open} maxWidth={false} closeAfterTransition={false}>
        <DlgTitle title={'수위계 그룹 경고'} handleClose={handleClose} />

        <DialogContent dividers>
          <Box className='flex flex-col gap-1'>
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
            <Box className='flex flex-row gap-1'>
              <Typography>{water2?.water_nm}</Typography>
              <Box className='flex-1' />
              <WaterLevelBadge
                sx={{ background: `${waterutils.waterLevelColor(water2?.water_stat)}` }}
              >
                {water2?.water_level}
              </WaterLevelBadge>
              <CdIdLabel grp='CS' id={water2?.comm_stat ?? ''} isStat />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ margin: 'auto' }}>
          <SettingBtn autoFocus onClick={handleClose} sx={{ minWidth: 100 }} btnType='confirm'>
            확인
          </SettingBtn>
        </DialogActions>
      </DlgBase>
    </React.Fragment>
  );
});

DlgWaterGrpWarn.displayName = 'DlgWaterGrpWarn';
export const useDlgWaterGrpWarn = () => useRefComponent<IfDlgWaterGrpWarn>(DlgWaterGrpWarn);
