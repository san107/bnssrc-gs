import { usePromise } from '@/hooks/usePromise';
import { useRefComponent } from '@/hooks/useRefComponent';
import { IfTbEbrd } from '@/models/ebrd/tb_ebrd';
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
  show: (props: { ebrdSeqs?: number[] }) => Promise<{ cmd: string; ebrdSeqs?: number[] }>;
};

export const DlgEbrdMulti = React.forwardRef<Props, unknown>((props, ref) => {
  const [open, setOpen] = useState(false);
  const promise = usePromise<any, any>();

  const { data: list } = useSWR<IfTbEbrd[]>(open && ['/api/ebrd/list']);

  const [ebrdSeqs, setEbrdSeqs] = useState<Set<number>>(new Set());

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
      show: ({ ebrdSeqs }) => {
        return new Promise((resolve, reject) => {
          promise.current.resolve = resolve;
          promise.current.reject = reject;
          setEbrdSeqs(new Set(ebrdSeqs || []));
          handleClickOpen();
        });
      },
    })
  );

  const handleClickOk = () => {
    setOpen(false);
    promise.current.resolve?.({ cmd: 'ok', ebrdSeqs: Array.from(ebrdSeqs) });
  };
  return (
    <React.Fragment>
      <BootstrapDialog onClose={handleClose} open={open}>
        <DialogTitle sx={{ m: 0, p: 2, minHeight: 50 }}>전광판 선택</DialogTitle>
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
                key={ele.ebrd_seq}
                className={clsx({ sel: ebrdSeqs.has(ele.ebrd_seq!) })}
                onClick={() => {
                  const set = new Set(ebrdSeqs);
                  if (set.has(ele.ebrd_seq!)) set.delete(ele.ebrd_seq!);
                  else set.add(ele.ebrd_seq!);
                  setEbrdSeqs(set);
                }}
              >
                <Checkbox checked={ebrdSeqs.has(ele.ebrd_seq!)} />
                <ListItemText primary={'' + ele.ebrd_seq + ' ' + ele.ebrd_nm} />
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

DlgEbrdMulti.displayName = 'DlgEbrdMulti';
export const useDlgEbrdMulti = () => useRefComponent<Props>(DlgEbrdMulti);
