import { CdIdLabel } from '@/app/(admin)/comp/input/CdIdLabel';
import { usePromise } from '@/hooks/usePromise';
import { useRefComponent } from '@/hooks/useRefComponent';
import { IfTbCamera } from '@/models/tb_camera';
import CloseIcon from '@mui/icons-material/Close';
import { Box, Checkbox, List, ListItemButton, ListItemText } from '@mui/material';
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
  show: (props: { camSeqs?: number[] }) => Promise<{ cmd: string; camSeqs?: number[] }>;
};

export const DlgCameraMulti = React.forwardRef<Props, unknown>((props, ref) => {
  const [open, setOpen] = useState(false);
  const promise = usePromise<any, any>();

  const { data: list } = useSWR<IfTbCamera[]>(open && ['/api/camera/list']);

  const [camSeqs, setCamSeqs] = useState<Set<number>>(new Set());

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
      show: ({ camSeqs }) => {
        return new Promise((resolve, reject) => {
          promise.current.resolve = resolve;
          promise.current.reject = reject;
          setCamSeqs(new Set(camSeqs || []));
          handleClickOpen();
        });
      },
    })
  );

  // const handleConfirm = () => {
  //   setOpen(false);
  //   promise.current.resolve?.({ cmd: 'ok' });
  // };
  const handleClickOk = () => {
    setOpen(false);
    promise.current.resolve?.({ cmd: 'ok', camSeqs: Array.from(camSeqs) });
  };
  return (
    <React.Fragment>
      <BootstrapDialog onClose={handleClose} open={open}>
        <DialogTitle sx={{ m: 0, p: 2, minHeight: 50 }}>카메라 선택</DialogTitle>
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
                key={ele.cam_seq}
                className={clsx({ sel: camSeqs.has(ele.cam_seq!) })}
                onClick={() => {
                  const set = new Set(camSeqs);
                  if (set.has(ele.cam_seq!)) set.delete(ele.cam_seq!);
                  else set.add(ele.cam_seq!);
                  setCamSeqs(set);
                }}
              >
                <Checkbox checked={camSeqs.has(ele.cam_seq!)} />
                <ListItemText primary={'' + ele.cam_seq + ' ' + ele.cam_nm} />
                <Box className='grow'></Box>
                <Box>
                  <CdIdLabel grp='CS' id={ele.cam_stat} />
                </Box>
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

DlgCameraMulti.displayName = 'DlgCameraMulti';
export const useDlgCameraMulti = () => useRefComponent<Props>(DlgCameraMulti);
