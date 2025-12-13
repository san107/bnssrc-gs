import { usePromise } from '@/hooks/usePromise';
import { useRefComponent } from '@/hooks/useRefComponent';
import { IfTbEmcall } from '@/models/emcall/tb_emcall';
import CloseIcon from '@mui/icons-material/Close';
import { Checkbox, List, ListItemButton, ListItemText } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import clsx from 'clsx';
import * as React from 'react';
import { useState } from 'react';
import useSWR from 'swr';

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
  show: (props: { emcallSeqs?: number[] }) => Promise<{ cmd: string; emcallSeqs?: number[] }>;
};

export const DlgEmcallMulti = React.forwardRef<Props, unknown>((props, ref) => {
  const [open, setOpen] = useState(false);
  const promise = usePromise<any, any>();

  const { data: list } = useSWR<IfTbEmcall[]>(open && ['/api/emcall/list']);

  const [emcallSeqs, setEmcallSeqs] = useState<Set<number>>(new Set());

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    promise.current.reject?.({ cmd: 'close' });
  };

  React.useImperativeHandle<Props, Props>(
    ref,
    (): Props => ({
      show: ({ emcallSeqs }) => {
        return new Promise((resolve, reject) => {
          promise.current.resolve = resolve;
          promise.current.reject = reject;
          setEmcallSeqs(new Set(emcallSeqs || []));
          handleClickOpen();
        });
      },
    })
  );

  const handleClickOk = () => {
    setOpen(false);
    promise.current.resolve?.({ cmd: 'ok', emcallSeqs: Array.from(emcallSeqs) });
  };
  return (
    <React.Fragment>
      <BootstrapDialog onClose={handleClose} open={open}>
        <DialogTitle sx={{ m: 0, p: 2, minHeight: 50 }}>비상통화장치 선택</DialogTitle>
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
        <DialogContent
          dividers
          sx={{
            '&.MuiDialogContent-root': {
              padding: 0,
            },
            '& .MuiListItemButton-root': {
              borderBottom: '1px solid #ddf',
              '&:last-child': {
                borderBottom: 0,
              },
            },
          }}
        >
          <List
            component='div'
            sx={{
              overflow: 'auto',
              height: '250px',
              margin: 0,
              '& .sel': {
                backgroundColor: '#eef',
              },
            }}
          >
            {(list || []).map((ele) => (
              <ListItemButton
                key={ele.emcall_seq}
                className={clsx({ sel: emcallSeqs.has(ele.emcall_seq!) })}
                onClick={() => {
                  const set = new Set(emcallSeqs);
                  if (set.has(ele.emcall_seq!)) set.delete(ele.emcall_seq!);
                  else set.add(ele.emcall_seq!);
                  setEmcallSeqs(set);
                }}
              >
                <Checkbox checked={emcallSeqs.has(ele.emcall_seq!)} />
                <ListItemText primary={'' + ele.emcall_seq + ' ' + ele.emcall_nm} />
              </ListItemButton>
            ))}
          </List>
        </DialogContent>
        <DialogActions sx={{ margin: 'auto' }}>
          <Button onClick={handleClose} sx={{ minWidth: 100 }} color='secondary'>
            취소
          </Button>
          <Button autoFocus onClick={handleClickOk} color='primary' sx={{ minWidth: 100 }}>
            확 인
          </Button>
        </DialogActions>
      </BootstrapDialog>
    </React.Fragment>
  );
});

DlgEmcallMulti.displayName = 'DlgEmcallMulti';
export const useDlgEmcallMulti = () => useRefComponent<Props>(DlgEmcallMulti);
