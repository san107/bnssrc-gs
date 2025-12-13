'use client';

import { CameraViewer } from '@/app/(admin)/comp/display/CameraViewer';
import CamThumbView from '@/app/(admin)/comp/display/CamThumbView';
import { BtnCameraExpand } from '@/app/(admin)/comp/drawer/BtnCameraExpand';
import { useDrawerStore } from '@/app/(admin)/comp/drawer/useDrawerStore';
import { CdIdLabel } from '@/app/(admin)/comp/input/CdIdLabel';
import { useConfirm } from '@/app/(admin)/comp/popup/DlgConfirm';
import { useDlgDateRange } from '@/app/(admin)/comp/popup/DlgDateRange';
import { SettingBtn } from '@/app/(admin)/settings/alm/SettingBtn';
import { isGateCmd, isGateStat, useWsMsg } from '@/app/ws/useWsMsg';
import { usePromise } from '@/hooks/usePromise';
import { useRefComponent } from '@/hooks/useRefComponent';
import { IfTbCamera, TbCamera } from '@/models/tb_camera';
import { GateCmdRes, IfTbGate, TbGate } from '@/models/gate/tb_gate';
import { IfTbGateHist } from '@/models/gate/tb_gate_hist';
import { dateutil } from '@/utils/date-util';
import * as gateutils from '@/utils/gate-utils';
import { gconf } from '@/utils/gconf';
import { exportToXlsHeadersObjs } from '@/utils/xls-utils';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import { LinearProgress } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import useSWR, { useSWRConfig } from 'swr';
import useSWRInfinite from 'swr/infinite';
import { create } from 'zustand';
import { useMobile } from '@/hooks/useMobile';
import { useDlgAutogate } from '@/app/(admin)/comp/gatectl/autogate/DlgAutogate';
import { useDlgDoori } from '@/app/(admin)/comp/gatectl/doori/DlgDoori';
import { useDlgHpsys } from '@/app/(admin)/comp/gatectl/hpsys/DlgHpsys';
import { useDlgHngsk } from '@/app/(admin)/comp/gatectl/hngsk/DlgHngsk';
import { handleDialogRejection } from '@/utils/dialog-utils';
import { useDlgFptech } from '@/app/(admin)/comp/gatectl/fptech/DlgFptech';
import { useDlgHpsysCrtn } from '@/app/(admin)/comp/gatectl/hpsys_crtn/DlgHpsysCrtn';
import { useDlgItson } from '@/app/(admin)/comp/gatectl/itson/DlgItson';
import { useDlgYesung } from '@/app/(admin)/comp/gatectl/yesung/DlgYesung';
import { lang } from '@/utils/lang';

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
  open: (data: TbGate) => Promise<any>;
  isOpened: boolean;
};

export const DrawerGate = React.forwardRef<Props, unknown>((props, ref) => {
  const [open, setOpen] = useState(false);
  const promise = usePromise<any, any>();
  const [gateSeq, setGateSeq] = useState<number | undefined>(undefined);
  const { data, mutate: mutateGate } = useSWR<TbGate>(
    open && !!gateSeq && ['/api/gate/one', { gateSeq }]
  );
  const { data: camList } = useSWR<IfTbCamera[]>(
    open && data?.gate_seq ? [`/api/gate_camera/camlist?gateSeq=${data?.gate_seq}`] : null
  );
  const { data: dataCam } = useSWR<TbCamera>(
    open && data?.cam_seq ? [`/api/camera/one?camSeq=${data?.cam_seq}`] : null
  );
  const [camView, setCamView] = useState<boolean>(false);
  const { mutate } = useSWRConfig();
  const { drawerType, setDrawerType } = useDrawerStore();
  const confirm = useConfirm();
  const { isMobile } = useMobile();

  useEffect(() => {
    setCamView(false);
  }, [data?.gate_seq]);

  useEffect(() => {
    if (!open) return;
    setDrawerType('gate');
  }, [open, setDrawerType]);

  useEffect(() => {
    if (drawerType === 'gate') return;
    setOpen(false);
  }, [drawerType]);

  useWsMsg((msg) => {
    if (!open) return; // 열려있지 않은 경우 skip
    if (isGateCmd(msg) || isGateStat(msg)) {
      mutateGateHist(); // infinite mutate.
      mutateGate();
    }
  });

  const limit = 10;
  const getKey = (pageIndex, previousPageData) => {
    if (!open) return null;
    if (!data?.gate_seq) return null;
    if (previousPageData && !previousPageData.length) return null;

    const key = `/api/gate_hist/pagelist?gateSeq=${data?.gate_seq}&offset=${pageIndex * limit
      }&limit=${limit}`;
    return key;
  };
  const {
    data: histList,
    size,
    setSize,
    mutate: mutateGateHist,
  } = useSWRInfinite<IfTbGateHist[]>(getKey, (key) => axios.get(key).then((res) => res.data));

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const [inControl, setInControl] = useState(new Set<number>());

  const gateCmd = (ele: IfTbGate, cmd: 'Up' | 'Down' | 'Stat') => {
    if (!cmd) return;

    const req = {
      gate_seq: ele.gate_seq,
      gate_cmd: cmd,
    };
    if (cmd === 'Up') {
      // 열기는 확인하지 않음.
      doGateCmd();
      return;
    }

    confirm('확인', [`게이트 ${gateutils.gateCmdTxt(cmd)}를 실행하시겠습니까?`])
      ?.then(() => {
        doGateCmd();
      })
      .catch((e) => {
        // 취소
        console.log('취소. ', e);
      });
    function doGateCmd() {
      setInControl(new Set(inControl.add(ele.gate_seq!)));
      axios
        .post<GateCmdRes>('/api/gate/control', req, { timeout: gconf.gateControlTimeoutMs })
        .then((res) => {
          console.log('res data is ', res.data);
          // 결과에 따라 달리 표시하도록.
          if (res.data.cmd_res === 'Success') {
            toast.success(`성공적으로 게이트를 ${cmd} 하였습니다.`);
          } else {
            toast.error(`게이트를 ${cmd} 하는데 실패하였습니다. (${res.data.cmd_res_msg})`);
          }
          mutate(() => true);
          mutateGateHist();
        })
        .catch((e) => {
          console.error('E', e);
        })
        .finally(() => {
          inControl.delete(ele.gate_seq!);
          setInControl(new Set(inControl));
        });
    }
  };

  const handleClickGateOpen = (ele: IfTbGate | undefined) => {
    if (!ele?.gate_seq) {
      toast.error('게이트를 선택하여 주세요.');
      return;
    }
    gateCmd(ele, 'Up');
  };

  const handleClickGateClose = (ele: IfTbGate | undefined) => {
    if (!ele?.gate_seq) {
      toast.error('게이트를 선택하여 주세요.');
      return;
    }
    gateCmd(ele, 'Down');
  };

  React.useImperativeHandle<Props, Props>(
    ref,
    (): Props => ({
      open: (data) => {
        return new Promise((resolve, reject) => {
          promise.current.resolve = resolve;
          promise.current.reject = reject;
          setGateSeq(data.gate_seq);
          handleDrawerOpen();
        });
      },
      isOpened: open,
    })
  );

  const isGateOpen = ['UpOk', 'UpLock'].includes(data?.gate_stat ?? '');
  const isGateClose = ['DownOk'].includes(data?.gate_stat ?? '');

  // const isEmpty = data?.[0]?.length === 0;
  const isEmpty = !histList || histList.length === 0 || (histList[0] && histList[0].length === 0);
  const isReachingEnd = isEmpty || (histList && histList[histList.length - 1]?.length < limit);

  const [refDlgDateRange, DlgDateRange] = useDlgDateRange();
  const handleXlsDown = async () => {
    const res = await refDlgDateRange.current?.show();
    const start = dateutil.toSaveDateZeroTime(res?.start);
    const end = dateutil.toSaveDateZeroTime(res?.end);
    const gateSeq = data?.gate_seq;
    const rlt = await axios.get<IfTbGateHist[]>(
      `/api/gate_hist/listrange?gateSeq=${gateSeq}&start=${start}&end=${end}`
    );
    //const map = await getCodeMap();
    const fhs = [
      ['gate_seq', '게이트번호'],
      ['gate_stat', '상태'],
      ['cmd_rslt', '결과'],
      ['cmd_rslt_msg', '비고'],
      ['update_dt', '일시'],
    ];
    // const objs = rlt.data.map((ele) => {
    //   return {
    //     ...ele,
    //     gate_stat_nm: getCodeName(map, 'GS', ele.gate_stat),
    //     cmd_rslt_nm: getCodeName(map, 'GR', ele.cmd_rslt),
    //   };
    // });
    const basename = `${data?.gate_seq}-${data?.gate_nm}`;
    exportToXlsHeadersObjs(fhs, rlt.data, basename);
  };

  const handleGateCtl = () => {
    console.log('handleGateCtl');
    if (data?.gate_type === 'Autogate') {
      dlgAutogate.current?.show({ gateSeq: data?.gate_seq }).catch((rejection) => {
        handleDialogRejection(rejection);
      });
    } else if (data?.gate_type === 'Doori') {
      dlgDoori.current?.show({ gateSeq: data?.gate_seq }).catch((rejection) => {
        handleDialogRejection(rejection);
      });
    } else if (data?.gate_type === 'Hngsk') {
      dlgHngsk.current?.show({ gateSeq: data?.gate_seq }).catch((rejection) => {
        handleDialogRejection(rejection);
      });
    } else if (data?.gate_type === 'Hpsys') {
      dlgHpsys.current?.show({ gateSeq: data?.gate_seq }).catch((rejection) => {
        handleDialogRejection(rejection);
      });
    } else if (data?.gate_type === 'HpsysCrtn') {
      dlgHpsysCrtn.current?.show({ gateSeq: data?.gate_seq }).catch((rejection) => {
        handleDialogRejection(rejection);
      });
    } else if (data?.gate_type === 'Itson') {
      dlgItson.current?.show({ gateSeq: data?.gate_seq }).catch((rejection) => {
        handleDialogRejection(rejection);
      });
    } else if (data?.gate_type === 'Fptech') {
      dlgFptech.current?.show({ gateSeq: data?.gate_seq }).catch((rejection) => {
        handleDialogRejection(rejection);
      });
    } else if (data?.gate_type === 'Yesung') {
      dlgYesung.current?.show({ gateSeq: data?.gate_seq }).catch((rejection) => {
        handleDialogRejection(rejection);
      });
    } else {
      console.error('unown gate type', data?.gate_type);
    }
  };

  const [dlgAutogate, DlgAutogate] = useDlgAutogate();
  const [dlgDoori, DlgDoori] = useDlgDoori();
  const [dlgHpsys, DlgHpsys] = useDlgHpsys();
  const [dlgItson, DlgItson] = useDlgItson();
  const [dlgHngsk, DlgHngsk] = useDlgHngsk();
  const [dlgFptech, DlgFptech] = useDlgFptech();
  const [dlgHpsysCrtn, DlgHpsysCrtn] = useDlgHpsysCrtn();
  const [dlgYesung, DlgYesung] = useDlgYesung();

  return (
    <Box sx={{ display: 'flex' }}>
      {camView && <CamThumbView gate_seq={data?.gate_seq} />}
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
            <Typography variant='h5'>차단장비 정보</Typography>
          </div>
          <div>
            <IconButton onClick={handleDrawerClose}>
              <CloseIcon />
            </IconButton>
          </div>
        </DrawerHeader>
        <Divider />
        <Box sx={{ display: 'flex', padding: 1 }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', minWidth: 0, flex: 1 }}>
            <Typography variant='h6' noWrap sx={{ minWidth: '220px' }}>
              {data?.gate_nm}
            </Typography>
            <Typography variant='body1' noWrap>
              {data?.gate_type}
            </Typography>
          </Box>
          <Box sx={{ ml: 2 }}>
            <Box
              sx={{
                //width: '40px',
                minWidth: '40px',
                height: '40px',
                padding: '0 3px',
                background: `${gateutils.gateStatColor(data?.gate_stat)}`,
                borderRadius: '20px',
                color: 'white',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <CdIdLabel grp='GS' id={data?.gate_stat} />
            </Box>
          </Box>
        </Box>
        <Divider />
        {/* <Box className='pl-1'>
          {data?.gate_ip}:{data?.gate_port}
        </Box> */}
        {data?.cam_seq && !isMobile && (
          <>
            <Box position={'relative'}>
              <CameraViewer width={'100%'} minHeight={270} cam_seq={data?.cam_seq} />
              <BtnCameraExpand data={dataCam} gates={data} />
            </Box>
            <Divider />
          </>
        )}
        <Box sx={{ width: '100%', height: 10 }}>
          {inControl.has(data?.gate_seq || 0) && <LinearProgress sx={{ height: 8 }} />}
        </Box>
        <Box sx={{ display: 'flex', padding: 1, justifyContent: 'center' }}>
          <Button
            color='success'
            onClick={() => handleClickGateOpen(data)}
            disabled={isGateOpen || inControl.has(data?.gate_seq || 0)}
          >
            {lang.open}
          </Button>
          <Box sx={{ width: '20px' }}></Box>
          <Button
            color='error'
            onClick={() => handleClickGateClose(data)}
            disabled={isGateClose || inControl.has(data?.gate_seq || 0)}
          >
            {lang.close}
          </Button>
          {camList && camList?.length > 0 && !isMobile && (
            <>
              <Box sx={{ width: '60px' }}></Box>
              <Button
                variant='contained'
                size='small'
                color={camView ? 'secondary' : 'primary'}
                onClick={() => setCamView(!camView)}
              >
                {camView ? '전체 카메라닫기' : '전체 카메라보기'}
              </Button>
            </>
          )}
        </Box>
        <Divider />
        <Box sx={{ display: 'flex', padding: 1, gap: 1 }}>
          <Typography variant='h6'>개폐기록</Typography>
          <Box flexGrow={1} />
          {[
            'Doori', // 두리.
            'Hngsk', // 홍석.
            'Hpsys', // HP 시스템.
            'HpsysCrtn', // HP 커튼형.
            'Itson', // 이츠온.
            'Yesung', // 예성.
            // 'Fptech' , // 에프피텍.
          ].includes(data?.gate_type ?? '') &&
            !isMobile && (
              <Button
                variant='contained'
                color='primary'
                onClick={handleGateCtl}
                disabled={!data?.gate_type}
              >
                상세 제어
              </Button>
            )}
          <SettingBtn btnType='xls' onClick={handleXlsDown}>
            엑셀
          </SettingBtn>
        </Box>
        <Divider />
        <Box sx={{ overflow: 'auto' }}>
          <table className='gate' style={{ tableLayout: 'fixed', width: '100%' }}>
            <colgroup>
              <col style={{ width: '30%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '40%' }} />
            </colgroup>
            <thead>
              <tr>
                <th>일시</th>
                <th>상태</th>
                <th>결과</th>
                <th>비고</th>
              </tr>
            </thead>
            <tbody>
              {isEmpty ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '10px' }}>
                    데이터가 없습니다.
                  </td>
                </tr>
              ) : (
                (histList || []).map((list) =>
                  list.map((row) => (
                    <tr key={row?.gate_hist_seq}>
                      <td>
                        {row?.update_dt?.substring(0, 10)}
                        <br />
                        {row?.update_dt?.substring(11)}
                      </td>
                      <td>
                        <CdIdLabel grp='GS' id={row?.gate_stat} />
                      </td>
                      <td>
                        <CdIdLabel grp='GR' id={row?.cmd_rslt} />
                      </td>
                      <td style={{ wordBreak: 'break-all' }}>{row?.cmd_rslt_msg}</td>
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
      <DlgAutogate />
      <DlgDoori />
      <DlgHpsys />
      <DlgItson />
      <DlgHngsk />
      <DlgFptech />
      <DlgHpsysCrtn />
      <DlgYesung />
    </Box>
  );
});

DrawerGate.displayName = 'DrawerGate';
export const useDrawerGate = () => useRefComponent<Props>(DrawerGate);

export const useDrawerGateStore = create<{
  setRef: (v: React.RefObject<Props | null> | null) => void;
  ref: React.RefObject<Props | null> | null;
}>((set) => ({
  setRef: (v: React.RefObject<Props | null> | null) => set({ ref: v }),
  ref: null,
}));
