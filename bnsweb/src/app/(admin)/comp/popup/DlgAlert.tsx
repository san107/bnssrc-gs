import { SettingBtn } from '@/app/(admin)/settings/alm/SettingBtn';
import { usePromise } from '@/hooks/usePromise';
import { useRefComponent } from '@/hooks/useRefComponent';
import CloseIcon from '@mui/icons-material/Close';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import * as React from 'react';
import { create } from 'zustand';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
    minWidth: 400,
    minHeight: 170,
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

type Props = {
  show: (title: string, msgs: string[]) => Promise<any>;
  hide: () => Promise<any>;
};

export const DlgAlert = React.forwardRef<Props, unknown>((props, ref) => {
  const [open, setOpen] = React.useState(false);
  const promise = usePromise<any, any>();

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    // 오류로 임시 주석 처리
    // promise.current.reject?.({ cmd: "close" });
  };

  const [title, seTtitle] = React.useState('');
  const [msgs, setMsgs] = React.useState<string[]>([]);

  React.useImperativeHandle<Props, Props>(
    ref,
    (): Props => ({
      show: (title, msgs) => {
        return new Promise((resolve, reject) => {
          promise.current.resolve = resolve;
          promise.current.reject = reject;
          seTtitle(title || '확인');
          setMsgs(msgs);
          handleClickOpen();
        });
      },
      hide: () => {
        return new Promise(() => handleClose());
      },
    })
  );

  return (
    <React.Fragment>
      <BootstrapDialog onClose={handleClose} open={open}>
        <DialogTitle sx={{ m: 0, p: 2, minHeight: 50 }}>{title}</DialogTitle>
        <IconButton
          aria-label='close'
          onClick={handleClose}
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
          {msgs.map((ele, idx) => (
            <Typography gutterBottom key={idx}>
              {ele}
            </Typography>
          ))}
        </DialogContent>
        <DialogActions sx={{ margin: 'auto' }}>
          <SettingBtn
            autoFocus
            onClick={handleClose}
            variant='contained'
            sx={{ minWidth: 100 }}
            btnType='confirm'
          >
            확 인
          </SettingBtn>
        </DialogActions>
      </BootstrapDialog>
    </React.Fragment>
  );
});

DlgAlert.displayName = 'DlgAlert';
export const useDlgAlert = () => useRefComponent<Props>(DlgAlert);

export const useAlertStore = create<{
  setRef: (v: React.RefObject<Props | null> | null) => void;
  ref: React.RefObject<Props | null> | null;
}>((set) => ({
  setRef: (v: React.RefObject<Props | null> | null) => set({ ref: v }),
  ref: null,
}));

export const useAlert = () => {
  const { ref } = useAlertStore();

  return (title: string, msgs: string[]): Promise<unknown> | undefined => {
    //
    return ref?.current?.show(title, msgs);
  };
};
