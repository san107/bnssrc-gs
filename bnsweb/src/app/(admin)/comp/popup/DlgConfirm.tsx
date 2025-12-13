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
};

export const DlgConfirm = React.forwardRef<Props, unknown>((props, ref) => {
  const [open, setOpen] = React.useState(false);
  const promise = usePromise<any, any>();

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    promise.current.reject?.({ cmd: 'close' });
  };
  const handleConfirm = () => {
    setOpen(false);
    promise.current.resolve?.({ cmd: 'ok' });
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
    })
  );

  return (
    <React.Fragment>
      <BootstrapDialog
        onClose={handleClose}
        open={open}
        container={() => document.getElementById('modal-container')}
      >
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
          <SettingBtn onClick={handleClose} sx={{ minWidth: 100 }} btnType='cancel'>
            취소
          </SettingBtn>
          <SettingBtn autoFocus onClick={handleConfirm} btnType='confirm' sx={{ minWidth: 100 }}>
            확 인
          </SettingBtn>
        </DialogActions>
      </BootstrapDialog>
    </React.Fragment>
  );
});

DlgConfirm.displayName = 'DlgConfirm';
export const useDlgConfrim = () => useRefComponent<Props>(DlgConfirm);

export const useConfirmStore = create<{
  setRef: (v: React.RefObject<Props | null> | null) => void;
  ref: React.RefObject<Props | null> | null;
}>((set) => ({
  setRef: (v: React.RefObject<Props | null> | null) => set({ ref: v }),
  ref: null,
}));

export const useConfirm = () => {
  const { ref } = useConfirmStore();

  return (title: string, msgs: string[]): Promise<{ cmd: string }> | undefined => {
    return ref?.current?.show(title, msgs);
  };
};
