import { CameraViewer } from '@/app/(admin)/comp/display/CameraViewer';
import CamThumbView from '@/app/(admin)/comp/display/CamThumbView';
import { BtnCameraExpand } from '@/app/(admin)/comp/drawer/BtnCameraExpand';
import { useDrawerStore } from '@/app/(admin)/comp/drawer/useDrawerStore';
import { useDlgDateRange } from '@/app/(admin)/comp/popup/DlgDateRange';
import { SettingBtn } from '@/app/(admin)/settings/alm/SettingBtn';
import { isWaterEvt, isWaterStat, useWsMsg } from '@/app/ws/useWsMsg';
import { usePromise } from '@/hooks/usePromise';
import { useRefComponent } from '@/hooks/useRefComponent';
import { IfTbCamera } from '@/models/tb_camera';
import { TbWater } from '@/models/water/tb_water';
import { IfTbWaterHist } from '@/models/water/tb_water_hist';
import { dateutil } from '@/utils/date-util';
import * as waterutils from '@/utils/water-utils';
import { exportToXlsHeadersObjs } from '@/utils/xls-utils';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import { Button, SvgIcon } from '@mui/material';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { PiNetwork, PiNetworkSlash } from 'react-icons/pi';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { create } from 'zustand';
import { useMobile } from '@/hooks/useMobile';
import { CdIdLabel } from '@/app/(admin)/comp/input/CdIdLabel';

const leftMenuWidth = 0;
const drawerWidth = 360;

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
  background: '#edf2fa',
}));

type Props = {
  open: (data: TbWater) => Promise<any>;
  isOpened: boolean;
};

export const DrawerWater = React.forwardRef<Props, unknown>((props, ref) => {
  const [open, setOpen] = useState(false);
  const promise = usePromise<any, any>();
  const [param, setParam] = useState(new TbWater());
  const { data, mutate: mutateWaterOne } = useSWR<TbWater>(
    open && !!param?.water_seq && ['/api/water/one', { waterSeq: param?.water_seq }]
  );
  const { data: camList } = useSWR<IfTbCamera[]>(
    open && data?.water_seq ? [`/api/camera/findbywater?waterSeq=${data?.water_seq}`] : null
  );
  const [camView, setCamView] = useState<boolean>(false);
  const { drawerType, setDrawerType } = useDrawerStore();
  const { isMobile } = useMobile();

  useEffect(() => {
    setCamView(false);
  }, [data?.water_seq]);

  useEffect(() => {
    if (!open) return;
    setDrawerType('water');
  }, [open, setDrawerType]);

  useEffect(() => {
    if (drawerType === 'water') return;
    setOpen(false);
  }, [drawerType]);

  const limit = 10;

  const getKey = (pageIndex, previousPageData) => {
    if (!open) return null;
    if (!data?.water_dev_id) return null;
    if (previousPageData && !previousPageData.length) return null;
    const key = `/api/water_hist/pagelist?waterDevId=${data?.water_dev_id}&offset=${
      pageIndex * limit
    }&limit=${limit}`;
    return key;
  };
  const {
    data: histList,
    size,
    setSize,
    mutate: mutateHist,
  } = useSWRInfinite<IfTbWaterHist[]>(getKey, (key) => axios.get(key).then((res) => res.data));

  useWsMsg((msg) => {
    if (!open) return false; // 열리지 않은 경우에는 skip 처리함.
    if (isWaterEvt(msg)) {
      // 데이터 갱신처리.
      mutateHist(); // 키로 처리가 안되는듯.
      mutateWaterOne();
    } else if (isWaterStat(msg)) {
      mutateWaterOne();
    }
  });

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  React.useImperativeHandle<Props, Props>(
    ref,
    (): Props => ({
      open: (data) => {
        return new Promise((resolve, reject) => {
          promise.current.resolve = resolve;
          promise.current.reject = reject;
          setParam(data);
          handleDrawerOpen();
        });
      },
      isOpened: open,
    })
  );

  const isEmpty = !histList || histList.length === 0 || (histList[0] && histList[0].length === 0);
  const isReachingEnd = isEmpty || (histList && histList[histList.length - 1]?.length < limit);

  const [refDlgDateRange, DlgDateRange] = useDlgDateRange();
  const handleXlsDown = async () => {
    const res = await refDlgDateRange.current?.show();
    const start = dateutil.toSaveDateZeroTime(res?.start);
    const end = dateutil.toSaveDateZeroTime(res?.end);
    const waterDevId = data?.water_dev_id;
    const rlt = await axios.get(
      `/api/water_hist/listrange?waterDevId=${waterDevId}&start=${start}&end=${end}`
    );
    const fhs = [
      ['water_dev_id', '수위계ID'],
      ['water_dt', '일시'],
      ['water_level', '값'],
    ];
    const basename = `${data?.water_dev_id}`;
    exportToXlsHeadersObjs(fhs, rlt.data, basename);
  };
  return (
    <Box sx={{ display: 'flex' }}>
      {camView && (
        <Box className='camera-footer'>
          <CamThumbView cameras={camList} />
        </Box>
      )}
      <Drawer
        transitionDuration={0} // 애니메이션 X
        sx={{
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: isMobile ? '100%' : drawerWidth,
            boxSizing: 'border-box',
            position: 'absolute',
            marginLeft: leftMenuWidth,
            // 모바일에서 가로 드래그만 방지 (세로 스크롤은 허용)
            touchAction: 'pan-y',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
          },
        }}
        variant='persistent'
        // variant='permanent'
        anchor='left'
        open={open}
      >
        <DrawerHeader sx={{ display: 'flex' }}>
          <InfoIcon color='primary' />
          <div style={{ marginRight: 'auto', paddingLeft: '10px' }}>
            <Typography variant='h5'>수위계 정보</Typography>
          </div>
          <div>
            <IconButton onClick={handleDrawerClose}>
              <CloseIcon />
            </IconButton>
          </div>
        </DrawerHeader>
        <Divider />
        <Box sx={{ display: 'flex', padding: 1 }}>
          <Typography variant='h6'>{data?.water_nm}</Typography>
          <Box flexGrow={1}></Box>
          {data?.comm_stat && (
            <Box
              sx={{
                color: 'white',
                padding: '5px 16px',
                borderRadius: '20px',
                textAlign: 'center',
                backgroundColor: waterutils.statColor(data?.comm_stat),
              }}
            >
              <SvgIcon>{data?.comm_stat === 'Ok' ? <PiNetwork /> : <PiNetworkSlash />}</SvgIcon>
              &nbsp;
              <CdIdLabel grp='CS' id={data?.comm_stat} />
            </Box>
          )}
        </Box>
        <Divider />
        <Box sx={{ display: 'flex', padding: 1 }}>
          <Box sx={{ display: 'flex', width: '30%' }}>
            <Typography variant='h6'>현재수위</Typography>
          </Box>
          <Box sx={{ display: 'flex', width: '70%', justifyContent: 'right', alignItems: 'right' }}>
            <Box
              sx={{
                //width: '40px',
                minWidth: '40px',
                height: '40px',
                padding: '0px 5px',
                background: `${waterutils.waterLevelColor(data?.water_stat)}`,
                borderRadius: '20px',
                color: 'white',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {data?.water_level}
            </Box>
          </Box>
        </Box>
        <Box sx={{ textAlign: 'center', color: 'gray' }}>
          관심: {data?.limit_attn} 주의: {data?.limit_warn} 경계: {data?.limit_alert} 심각:{' '}
          {data?.limit_crit}
        </Box>
        <Divider />
        {data?.cam_seq && !isMobile && (
          <>
            <Box position={'relative'}>
              <CameraViewer width={'100%'} minHeight={270} cam_seq={data?.cam_seq} />
              <BtnCameraExpand camSeq={data?.cam_seq} />
            </Box>
            <Divider />
          </>
        )}
        <Box sx={{ display: 'flex', padding: 1 }}>
          <Typography variant='h6'>상세내용</Typography>
          <Box flexGrow={1} />
          <SettingBtn btnType='xls' onClick={handleXlsDown} sx={{ marginRight: 1 }}>
            XLS
          </SettingBtn>
          {camList && camList?.length > 0 && !isMobile && (
            <Button
              variant='contained'
              size='small'
              color={camView ? 'secondary' : 'primary'}
              onClick={() => setCamView(!camView)}
            >
              {camView ? '연동 차단장비 카메라닫기' : '연동 차단장비 카메라보기'}
            </Button>
          )}
        </Box>
        <Divider />
        <Box className='overflow-auto'>
          <table className='water'>
            <colgroup>
              <col style={{ width: '50%' }} />
              <col style={{ width: '25%' }} />
              <col style={{ width: '25%' }} />
            </colgroup>
            <thead>
              <tr>
                <th>일시</th>
                <th>구분</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {isEmpty ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '10px' }}>
                    데이터가 없습니다.
                  </td>
                </tr>
              ) : (
                (histList || []).map((list) =>
                  list.map((row) => (
                    <tr key={row?.water_hist_seq}>
                      <td>
                        {row?.water_dt?.substring(0, 10)} &nbsp;
                        {row?.water_dt?.substring(11)}
                      </td>
                      <td>{row?.water_level}</td>
                      <td>
                        {waterutils.waterLevelText(
                          waterutils.calcStatWaterLevel(
                            data?.limit_attn || 0,
                            data?.limit_warn || 0,
                            data?.limit_alert || 0,
                            data?.limit_crit || 0,
                            row?.water_level || 0
                          )
                        )}
                      </td>
                    </tr>
                  ))
                )
              )}
            </tbody>
          </table>
        </Box>
        <Box sx={{ display: 'flex', padding: 1, justifyContent: 'center' }}>
          {!isReachingEnd && (
            <Button variant='contained' onClick={() => setSize(size + 1)}>
              더보기
            </Button>
          )}
        </Box>
      </Drawer>
      <DlgDateRange />
    </Box>
  );
});

DrawerWater.displayName = 'DrawerWater';
export const useDrawerWater = () => useRefComponent<Props>(DrawerWater);

export const useDrawerWaterStore = create<{
  setRef: (v: React.RefObject<Props | null> | null) => void;
  ref: React.RefObject<Props | null> | null;
}>((set) => ({
  setRef: (v: React.RefObject<Props | null> | null) => set({ ref: v }),
  ref: null,
}));
