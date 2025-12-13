'use client';
import { usePromise } from '@/hooks/usePromise';
import { useRefComponent } from '@/hooks/useRefComponent';
import { IfTbCamera, TbCamera } from '@/models/tb_camera';
import CancelIcon from '@mui/icons-material/Cancel';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import LinearProgress from '@mui/material/LinearProgress';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import * as React from 'react';
import { useState } from 'react';
import { GateCmdRes, IfTbGate, TbGate } from '@/models/gate/tb_gate';
import axios from 'axios';
import { toast } from 'sonner';
import { useSWRConfig } from 'swr';
import { CameraViewer } from '@/app/(admin)/comp/display/CameraViewer';
import { useConfirm } from '@/app/(admin)/comp/popup/DlgConfirm';
import * as gateutils from '@/utils/gate-utils';
import { gconf } from '@/utils/gconf';
import { lang } from '@/utils/lang';

const minHeight = 640;

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiPaper-root': {
    width: '100%',
    maxWidth: '1000px',
    // maxHeight: '800px',
    background: '#708090',
    color: 'white',
    borderRadius: '10px',
  },
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
    minWidth: 800,
    // minHeight: 640,
    // overflow: 'hidden',
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
  '& .MuiBackdrop-root': {
    backgroundColor: 'transparent',
  },
}));

type Props = {
  show: (data: IfTbCamera, small?: boolean, gates?: IfTbGate) => Promise<any>;
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

export const DlgCameraView = React.forwardRef<Props, unknown>((props, ref) => {
  const [open, setOpen] = useState(false);
  const promise = usePromise<any, any>();
  const [sel, setSel] = useState<IfTbCamera>(new TbCamera());
  const [small, setSmall] = useState<boolean>(false);
  const [gates, setGates] = useState<IfTbGate>(new TbGate());
  const { mutate } = useSWRConfig();
  const confirm = useConfirm();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose: CloseHandler = (_, reason) => {
    if (IGNORED_REASONS.includes(reason)) {
      return;
    }
    setSel(new TbCamera());
    setOpen(false);
    // 오류로 임시 주석 처리
    // promise.current.reject?.({ cmd: 'close' });
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
          setGates({ ...gates, gate_stat: res.data.gate_status });
          mutate(() => true);
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
      show: (data, small, gates) => {
        return new Promise((resolve, reject) => {
          promise.current.resolve = resolve;
          promise.current.reject = reject;
          setSmall(small || false);
          setSel(data);
          setGates(gates || new TbGate());
          handleClickOpen();
        });
      },
    })
  );

  const isGateOpen = ['UpOk', 'UpLock'].includes(gates?.gate_stat ?? '');
  const isGateClose = ['DownOk'].includes(gates?.gate_stat ?? '');

  return (
    <React.Fragment>
      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby='customized-dialog-title'
        open={open}
        closeAfterTransition={false}
        // disablePortal={true}
        // disableAutoFocus={true}
        container={() => document.getElementById('modal-container')}
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id='customized-dialog-title'>
          {sel?.cam_nm}
        </DialogTitle>
        <IconButton
          aria-label='close'
          onClick={(e) => handleClose(e, CLOSE_REASON.BUTTON)}
          sx={(theme) => ({
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          })}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent>
          <CameraViewer width={'100%'} minHeight={minHeight} cam_seq={sel?.cam_seq} small={small} />
        </DialogContent>
        <Box sx={{ width: '100%', height: 10 }}>
          {inControl.has(gates?.gate_seq || 0) && <LinearProgress sx={{ height: 8 }} />}
        </Box>
        <DialogActions>
          <Box sx={{ display: 'flex', minWidth: '100%' }}>
            {gates?.gate_seq && (
              <>
                <Box>
                  <Button
                    color='success'
                    size='medium'
                    onClick={() => handleClickGateOpen(gates)}
                    disabled={isGateOpen || inControl.has(gates?.gate_seq || 0)}
                  >
                    {lang.open}
                  </Button>
                </Box>
                <Box sx={{ width: '20px' }}></Box>
                <Box>
                  <Button
                    color='error'
                    size='medium'
                    onClick={() => handleClickGateClose(gates)}
                    disabled={isGateClose || inControl.has(gates?.gate_seq || 0)}
                  >
                    {lang.close}
                  </Button>
                </Box>
              </>
            )}
            <Box flexGrow={1}></Box>
            <Box>
              <Button
                color='primary'
                size='medium'
                startIcon={<CancelIcon />}
                onClick={(e) => handleClose(e, CLOSE_REASON.BUTTON)}
              >
                창닫기
              </Button>
            </Box>
          </Box>
        </DialogActions>
      </BootstrapDialog>
    </React.Fragment>
  );
});

DlgCameraView.displayName = 'DlgCameraView';
export const useDlgCameraView = () => useRefComponent<Props>(DlgCameraView);
