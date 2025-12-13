import { usePromise } from '@/hooks/usePromise';
import { useRefComponent } from '@/hooks/useRefComponent';
import { IfTbGate } from '@/models/gate/tb_gate';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';

import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { CdIdLabel } from '@/app/(admin)/comp/input/CdIdLabel';
import * as gateutils from '@/utils/gate-utils';
import { toast } from 'sonner';
import { useSWRConfig } from 'swr';
import NotiGroupForm from '@/app/(admin)/comp/display/NotiGroupForm';

import CamGateView from '@/app/(admin)/comp/display/CamGateView';
import { Grid } from '@mui/material';
import DisplaySettingsIcon from '@mui/icons-material/DisplaySettings';
import { useConfirm } from '@/app/(admin)/comp/popup/DlgConfirm';
import { useMobile } from '@/hooks/useMobile';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import { lang } from '@/utils/lang';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiPaper-root': {
    margin: '0',
    width: { xs: '100%', md: '1100px' },
    maxWidth: { xs: '100%', md: '1100px' },
    // maxHeight: '900px',
    borderRadius: '10px',
    background: '#708090',
    color: 'white',
  },
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
    width: { xs: '100%', md: '1100px' },
    // minHeight: 600,
    overflowY: 'hidden',
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

type Props = {
  show: (data: IfTbGate[]) => Promise<any>;
  hide: () => Promise<any>;
};

type LookupValues<Values> = Values[keyof Values];
const CLOSE_REASON = {
  BUTTON: 'closeButtonClick',
  BACKDROP: 'backdropClick',
  ESCAPE: 'escapeKeyDown',
};

type CloseReason = LookupValues<typeof CLOSE_REASON>;
const IGNORED_REASONS: CloseReason[] = [CLOSE_REASON.BACKDROP, CLOSE_REASON.ESCAPE];
type CloseHandler = (event: object, reason: CloseReason) => void;

export const DlgControlGate = React.forwardRef<Props, unknown>((props, ref) => {
  const [open, setOpen] = useState(false);
  const promise = usePromise<any, any>();
  const [checkItems, setCheckItems] = useState<IfTbGate[]>([]);
  const [load, setLoad] = useState<boolean>(false);
  const [viewObj, setViewObj] = useState<object[]>([]);
  const { mutate } = useSWRConfig();
  const confirm = useConfirm();
  const { isMobile } = useMobile();
  const [cameraOn, setCameraOn] = useState<boolean>(true);

  useEffect(() => {
    setViewObj(checkItems);
    // 선택된 차단기 개수가 10개보다 많으면 카메라를 Off, 10개 미만이면 On 으로 설정
    if (checkItems.length > 10) {
      setCameraOn(false);
    } else {
      setCameraOn(true);
    }
  }, [checkItems]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClickClose: CloseHandler = (_, reason) => {
    if (IGNORED_REASONS.includes(reason)) {
      return;
    }
    setOpen(false);
    // 오류로 임시 주석 처리
    // promise.current.reject?.({ cmd: 'close' });
  };

  const controlGateAllSettled = async (cmd: 'Up' | 'Down' | 'Stop') => {
    setLoad(true);

    // const isFulfilled = <T,>(p: PromiseSettledResult<T>): p is PromiseFulfilledResult<T> =>
    //   p.status === 'fulfilled';
    // const isRejected = <T,>(p: PromiseSettledResult<T>): p is PromiseRejectedResult =>
    //   p.status === 'rejected';
    // const results = await Promise.allSettled(
    //   checkItems.map((ele: IfTbGate) => {
    //     return gateutils.gateCmdAll(ele, cmd);
    //   })
    // );
    // const fulfilledGate = results.filter(isFulfilled).map((el) => el.value);
    // const rejectedGate = results.filter(isRejected).map((el) => el.reason);

    const tmpObj: object[] = [];
    await Promise.allSettled(
      checkItems.map((ele: IfTbGate) => {
        return gateutils.gateCmdAllSettled(ele, cmd);
      })
    ).then((rslts) => {
      // console.log('rslts', rslts);
      rslts.forEach((rslt) => {
        if (rslt.status === 'fulfilled') {
          // console.log(rslt.status, rslt.value);
          tmpObj.push(rslt.value);
        } else {
          // console.log(rslt.status, rslt.reason);
          tmpObj.push(rslt.reason);
        }
      });
    });

    setViewObj(tmpObj);
    setLoad(false);
    mutate(() => true);
    toast.success(`게이트 ${gateutils.gateCmdTxt(cmd)} 수행이 종료 되었습니다.`);
  };

  // 열기 제어
  const controlGateOpen = () => {
    // confirm('확인', ['게이트그룹 열기를 실행하시겠습니까?'])
    //   ?.then(() => {
    //     controlGateAllSettled('Up');
    //   })
    //   .catch((e) => {
    //     // 취소
    //     console.log('취소. ', e);
    //   });

    // 열기는 확인메시지 없어야 한다고 합니다. 2025.02.14
    controlGateAllSettled('Up');
  };

  // 닫기 제어
  const controlGateClose = () => {
    confirm('확인', ['게이트그룹 닫기를 실행하시겠습니까?'])
      ?.then(() => {
        controlGateAllSettled('Down');
      })
      .catch((e) => {
        // 취소
        console.log('취소. ', e);
      });
  };

  const groupRegist = () => {
    const notification = document.getElementById('form-group-container');
    if (notification) notification?.classList.add('show');
  };

  const toggleCamera = () => {
    setCameraOn(!cameraOn);
    toast.success(`전체 카메라가 ${!cameraOn ? '켜졌습니다' : '꺼졌습니다'}.`);
  };

  React.useImperativeHandle<Props, Props>(
    ref,
    (): Props => ({
      // show: (data: IfTbGate[]) => {
      show: (data) => {
        return new Promise((resolve, reject) => {
          promise.current.resolve = resolve;
          promise.current.reject = reject;
          setCheckItems(data);
          handleClickOpen();
        });
      },
      hide: () => {
        return new Promise((e) => handleClickClose(e, CLOSE_REASON.BUTTON));
      },
    })
  );

  return (
    <React.Fragment>
      <BootstrapDialog
        onClose={handleClickClose}
        aria-labelledby='customized-dialog-title'
        open={open}
        maxWidth={false}
        slotProps={{
          backdrop: {
            style: { position: 'fixed' },
          },
          paper: {
            style: {
              width: isMobile ? '100%' : '1100px',
              maxWidth: isMobile ? '100%' : '1100px',
            },
          },
        }}
        closeAfterTransition={false}
        container={() => document.getElementById('modal-container')}
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id='customized-dialog-title'>
          <DisplaySettingsIcon /> 차단장비 그룹 제어
        </DialogTitle>
        <IconButton
          aria-label='close'
          onClick={(e) => handleClickClose(e, CLOSE_REASON.BUTTON)}
          sx={(theme) => ({
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          })}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent dividers>
          <NotiGroupForm groups={viewObj} />
          <Grid container spacing={0}>
            <Grid size={isMobile ? 12 : 6}>
              <Box sx={{ display: 'flex', padding: 1, justifyContent: 'left' }}>
                <Button color='warning' onClick={() => groupRegist()}>
                  그룹등록
                </Button>
                <Box sx={{ width: '20px' }}></Box>
                <Button color='success' onClick={() => controlGateOpen()} disabled={load}>
                  {lang.open}
                </Button>
                <Box sx={{ width: '20px' }}></Box>
                <Button color='error' onClick={() => controlGateClose()} disabled={load}>
                  {lang.close}
                </Button>
                {!isMobile && (
                  <>
                    <Box sx={{ width: '20px' }}></Box>
                    <Button
                      color={cameraOn ? 'primary' : 'secondary'}
                      onClick={toggleCamera}
                      startIcon={cameraOn ? <VideocamIcon /> : <VideocamOffIcon />}
                    >
                      {cameraOn ? '전체 카메라 끄기' : '전체 카메라 켜기'}
                    </Button>
                  </>
                )}
                <Box sx={{ width: '100px' }}></Box>
                <Box>{load && <span className='loadctl'>제어 진행중</span>}</Box>
              </Box>
              <Box sx={{ maxHeight: '626px', overflowY: 'auto' }}>
                <table className='gateC' style={{ width: '100%' }}>
                  <colgroup>
                    <col style={{ width: isMobile ? '60%' : '50%' }} />
                    {!isMobile && <col style={{ width: '20%' }} />}
                    <col style={{ width: isMobile ? '20%' : '15%' }} />
                    <col style={{ width: isMobile ? '20%' : '15%' }} />
                  </colgroup>
                  <thead
                    style={{ position: 'sticky', top: 0, backgroundColor: '#708090', zIndex: 1 }}
                  >
                    <tr>
                      <th>차단장비 이름</th>
                      {!isMobile && <th style={{ textAlign: 'center' }}>차단장비 타입</th>}
                      <th style={{ textAlign: 'center' }}>상태</th>
                      <th style={{ textAlign: 'center' }}>처리 결과</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(viewObj || []).map((row) => (
                      <tr key={row['gate_seq']}>
                        <td
                          style={{
                            textAlign: 'left',
                            maxWidth: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {row['gate_nm']}
                        </td>
                        {!isMobile && (
                          <td style={{ textAlign: 'center' }}>
                            <CdIdLabel grp='GT' id={row['gate_type']} />
                          </td>
                        )}
                        <td style={{ textAlign: 'center' }}>
                          <Box
                            sx={{
                              width: '44px',
                              padding: '2px',
                              textAlign: 'center',
                              color: 'white',
                              borderRadius: '15%',
                              background: gateutils.gateStatColor(row['gate_stat'] || ''),
                              margin: '0 auto',
                            }}
                          >
                            <CdIdLabel grp='GS' id={row['gate_stat']} />
                          </Box>
                        </td>
                        <td style={{ textAlign: 'center' }}>{row['cmd_rslt']}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </Grid>
            {!isMobile && (
              <Grid size={6}>
                <CamGateView gateList={viewObj} enabled={cameraOn} />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={(e) => handleClickClose(e, CLOSE_REASON.BUTTON)}>
            창닫기
          </Button>
        </DialogActions>
      </BootstrapDialog>
    </React.Fragment>
  );
});

DlgControlGate.displayName = 'DlgControlGate';
export const useDlgControlGate = () => useRefComponent<Props>(DlgControlGate);
