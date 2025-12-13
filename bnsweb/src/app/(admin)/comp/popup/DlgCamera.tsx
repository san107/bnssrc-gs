import { CdIdLabel } from '@/app/(admin)/comp/input/CdIdLabel';
import { usePromise } from '@/hooks/usePromise';
import { useRefComponent } from '@/hooks/useRefComponent';
import { IfTbCamera } from '@/models/tb_camera';
import CloseIcon from '@mui/icons-material/Close';
import { Box, List, ListItemButton, ListItemText } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
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
  show: (props: {}) => Promise<{ cmd: string; camSeq?: number }>;
  //hide: () => Promise<{ cmd: string; camSeq?: number }>;
};

export const DlgCamera = React.forwardRef<Props, unknown>((props, ref) => {
  const [open, setOpen] = useState(false);
  const promise = usePromise<any, any>();

  const { data: list } = useSWR<IfTbCamera[]>(open && ['/api/camera/list']);

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
      show: ({}) => {
        return new Promise((resolve, reject) => {
          promise.current.resolve = resolve;
          promise.current.reject = reject;

          handleClickOpen();
        });
      },
      // hide: () => {
      //   return new Promise(() => handleClose());
      // },
    })
  );

  // const handleConfirm = () => {
  //   setOpen(false);
  //   promise.current.resolve?.({ cmd: 'ok' });
  // };
  const handleClickRow = (ele: IfTbCamera) => {
    //
    setOpen(false);
    promise.current.resolve?.({ cmd: 'ok', camSeq: ele.cam_seq });
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
          <List component='div' sx={{ overflow: 'auto', height: '250px', margin: 0 }}>
            {/* <ListItemButton
              selected={selectedIndex === 2}
              onClick={(event) => handleListItemClick(event, 2)}
            >
              <ListItemText primary='Trash' />
            </ListItemButton>
            <ListItemButton
              selected={selectedIndex === 3}
              onClick={(event) => handleListItemClick(event, 3)}
            >
              <ListItemText primary='Spam' />
            </ListItemButton> */}
            {(list || []).map((ele) => (
              <ListItemButton key={ele.cam_seq} onClick={() => handleClickRow(ele)}>
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
          {/* <Button autoFocus onClick={handleConfirm} color='primary' sx={{ minWidth: 100 }}>
            확 인
          </Button> */}
        </DialogActions>
      </BootstrapDialog>
    </React.Fragment>
  );
});

DlgCamera.displayName = 'DlgCamera';
export const useDlgCamera = () => useRefComponent<Props>(DlgCamera);
