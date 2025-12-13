import { usePromise } from '@/hooks/usePromise';
import { useRefComponent } from '@/hooks/useRefComponent';
import { IfTbGate } from '@/models/gate/tb_gate';
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
  show: (props: { gateSeqs?: number[] }) => Promise<{ cmd: string; gateSeqs?: number[] }>;
};

export const DlgGateMulti = React.forwardRef<Props, unknown>((props, ref) => {
  const [open, setOpen] = useState(false);
  const promise = usePromise<any, any>();

  const { data: list } = useSWR<IfTbGate[]>(open && ['/api/gate/list']);

  const [gateSeqs, setGateSeqs] = useState<Set<number>>(new Set());

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
      show: ({ gateSeqs }) => {
        return new Promise((resolve, reject) => {
          promise.current.resolve = resolve;
          promise.current.reject = reject;
          setGateSeqs(new Set(gateSeqs || []));
          handleClickOpen();
        });
      },
    })
  );

  const handleClickOk = () => {
    setOpen(false);
    promise.current.resolve?.({ cmd: 'ok', gateSeqs: Array.from(gateSeqs) });
  };
  return (
    <React.Fragment>
      <BootstrapDialog onClose={handleClose} open={open}>
        <DialogTitle sx={{ m: 0, p: 2, minHeight: 50 }}>차단장비 선택</DialogTitle>
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
                key={ele.gate_seq}
                className={clsx({ sel: gateSeqs.has(ele.gate_seq!) })}
                onClick={() => {
                  const set = new Set(gateSeqs);
                  if (set.has(ele.gate_seq!)) set.delete(ele.gate_seq!);
                  else set.add(ele.gate_seq!);
                  setGateSeqs(set);
                }}
              >
                <Checkbox checked={gateSeqs.has(ele.gate_seq!)} />
                <ListItemText primary={'' + ele.gate_seq + ' ' + ele.gate_nm} />
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

DlgGateMulti.displayName = 'DlgGateMulti';
export const useDlgGateMulti = () => useRefComponent<Props>(DlgGateMulti);
