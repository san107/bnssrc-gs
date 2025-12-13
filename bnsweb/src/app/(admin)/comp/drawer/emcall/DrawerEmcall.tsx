'use client';

import { useDrawerStore } from '@/app/(admin)/comp/drawer/useDrawerStore';
import { usePromise } from '@/hooks/usePromise';
import { useRefComponent } from '@/hooks/useRefComponent';
import { IfTbEmcall } from '@/models/emcall/tb_emcall';
import { useMobile } from '@/hooks/useMobile';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import { create } from 'zustand';
import React, { useEffect, useState } from 'react';
import { CameraViewer } from '@/app/(admin)/comp/display/CameraViewer';
import { BtnCameraExpand } from '@/app/(admin)/comp/drawer/BtnCameraExpand';
import { TbCamera } from '@/models/tb_camera';
import { IfTbEmcallEvtHist } from '@/models/emcall/tb_emcall_evt_hist';
import { CdIdLabel } from '@/app/(admin)/comp/input/CdIdLabel';
import { SettingBtn } from '@/app/(admin)/settings/alm/SettingBtn';
import { useDlgDateRange } from '@/app/(admin)/comp/popup/DlgDateRange';
import { dateutil } from '@/utils/date-util';
import { exportToXlsHeadersObjs } from '@/utils/xls-utils';
import axios from 'axios';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import Button from '@mui/material/Button';
import { useWsMsg } from '@/app/ws/useWsMsg';
import { isEmcallEvt } from '@/app/ws/useWsMsg';
import SvgIcon from '@mui/material/SvgIcon';
import { PiNetwork, PiNetworkSlash } from 'react-icons/pi';
import { EmcallGrpCtl } from '@/app/(admin)/comp/drawer/emcall/EmcallGrpCtl';
import * as emcallutils from '@/utils/emcall-utils';

const leftMenuWidth = 0;
const drawerWidth = 360;

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
  background: '#edf2fa',
}));

type Props = {
  open: (data: IfTbEmcall) => Promise<any>;
  isOpened: boolean;
};

export const DrawerEmcall = React.forwardRef<Props, unknown>((props, ref) => {
  const [open, setOpen] = useState(false);
  const promise = usePromise<any, any>();
  const [param, setParam] = useState<IfTbEmcall | null>(null);
  const { drawerType, setDrawerType } = useDrawerStore();
  const { isMobile } = useMobile();
  const [refDlgDateRange, DlgDateRange] = useDlgDateRange();

  const { data: dataCam } = useSWR<TbCamera>(
    open && param?.cam_seq ? [`/api/camera/one?camSeq=${param?.cam_seq}`] : null
  );

  useEffect(() => {
    if (!open) return;
    setDrawerType('emcall');
  }, [open, setDrawerType]);

  useEffect(() => {
    if (drawerType === 'emcall') return;
    setOpen(false);
  }, [drawerType]);

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

  useWsMsg((msg) => {
    if (!open) return; // 열려있지 않은 경우 skip
    if (isEmcallEvt(msg)) {
      mutateEmcallHist(); // infinite mutate.
    }
  });

  const limit = 10;
  const getKey = (pageIndex, previousPageData) => {
    if (!open) return null;
    if (!param?.emcall_seq) return null;
    if (previousPageData && !previousPageData.length) return null;

    const key = `/api/emcall_evt_hist/pagelist?emcallId=${param?.emcall_id}&offset=${
      pageIndex * limit
    }&limit=${limit}`;
    return key;
  };

  const {
    data: histList,
    size,
    setSize,
    mutate: mutateEmcallHist,
  } = useSWRInfinite<IfTbEmcallEvtHist[]>(getKey, (key) => axios.get(key).then((res) => res.data));

  const handleXlsDown = async () => {
    const res = await refDlgDateRange.current?.show();
    const start = dateutil.toSaveDateZeroTime(res?.start);
    const end = dateutil.toSaveDateZeroTime(res?.end);
    const rlt = await axios.get<IfTbEmcallEvtHist[]>(
      `/api/emcall_evt_hist/listrange?emcallId=${param?.emcall_id}&start=${start}&end=${end}`
    );
    const fhs = [
      ['emcall_id', '비상통화장치ID'],
      ['comm_stat', '통신상태'],
      ['emcall_evt_type', '이벤트타입'],
      ['emcall_evt_dt', '일시'],
    ];
    const basename = `${param?.emcall_seq}-${param?.emcall_nm}`;
    exportToXlsHeadersObjs(fhs, rlt.data, basename);
  };

  const isEmpty = histList?.[0]?.length === 0;
  const isReachingEnd = isEmpty || (histList && histList[histList.length - 1]?.length < limit);

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        transitionDuration={0}
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
        anchor='left'
        open={open}
      >
        <DrawerHeader sx={{ display: 'flex' }}>
          <InfoIcon color='primary' />
          <div style={{ marginRight: 'auto', paddingLeft: '10px' }}>
            <Typography variant='h5'>비상벨 정보</Typography>
          </div>
          <div>
            <IconButton onClick={handleDrawerClose}>
              <CloseIcon />
            </IconButton>
          </div>
        </DrawerHeader>
        <Divider />

        <Box sx={{ display: 'flex', padding: 1 }}>
          <Box>
            <Typography variant='h6'>
              {param?.emcall_nm}
              <span style={{ fontSize: '0.9em' }}>({param?.emcall_id})</span>
            </Typography>
          </Box>
          <Box flexGrow={1} />
          {param?.comm_stat && (
            <Box
              sx={{
                color: 'white',
                padding: '5px 16px',
                borderRadius: '20px',
                textAlign: 'center',
                minWidth: '93px',
                backgroundColor: emcallutils.emcallStatColor(param?.comm_stat),
              }}
            >
              <SvgIcon>{param?.comm_stat === 'Ok' ? <PiNetwork /> : <PiNetworkSlash />}</SvgIcon>
              &nbsp;
              <CdIdLabel grp='CS' id={param?.comm_stat} />
            </Box>
          )}
        </Box>
        <Divider />

        {/* 카메라 뷰 */}
        {param?.cam_seq && !isMobile && (
          <>
            <Box position={'relative'}>
              <CameraViewer width={'100%'} minHeight={270} cam_seq={param?.cam_seq} />
              <BtnCameraExpand data={dataCam} />
            </Box>
            <Divider />
          </>
        )}

        <EmcallGrpCtl grp_seq={param?.emcall_grp_seq} />
        <Divider />

        {/* 이벤트 이력 */}
        <Box sx={{ display: 'flex', padding: 1 }}>
          <Typography variant='h6'>이벤트 이력</Typography>
          <Box flexGrow={1} />
          <SettingBtn btnType='xls' onClick={handleXlsDown}>
            엑셀
          </SettingBtn>
        </Box>
        <Divider />
        <Box sx={{ overflow: 'auto' }}>
          <table className='camera'>
            <colgroup>
              <col style={{ width: '30%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '40%' }} />
            </colgroup>
            <thead>
              <tr>
                <th>일시</th>
                <th>통신상태</th>
                <th>이벤트타입</th>
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
                    <tr key={row?.emcall_evt_hist_seq}>
                      <td>
                        {row?.emcall_evt_dt?.substring(0, 10)}
                        <br />
                        {row?.emcall_evt_dt?.substring(11)}
                      </td>
                      <td>
                        <CdIdLabel grp='CS' id={row?.comm_stat} />
                      </td>
                      <td>
                        <CdIdLabel grp='EmcallEvt' id={row?.emcall_evt_type} />
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

DrawerEmcall.displayName = 'DrawerEmcall';
export const useDrawerEmcall = () => useRefComponent<Props>(DrawerEmcall);

export const useDrawerEmcallStore = create<{
  setRef: (v: React.RefObject<Props | null> | null) => void;
  ref: React.RefObject<Props | null> | null;
}>((set) => ({
  setRef: (v: React.RefObject<Props | null> | null) => set({ ref: v }),
  ref: null,
}));
