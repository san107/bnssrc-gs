import { BootstrapDialog } from '@/app/(admin)/comp/popup/BootstrapDialog';
import { EbrdMsgEdit } from '@/app/(admin)/settings/ebrd/comp/EbrdMsgEdit';
import { usePromise } from '@/hooks/usePromise';
import { useRefComponent } from '@/hooks/useRefComponent';
import CloseIcon from '@mui/icons-material/Close';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import * as React from 'react';
import { useState } from 'react';

type Props = {
  show: (props: { ebrd_seq?: number; ebrd_msg_pos?: number }) => Promise<{ cmd: string }>;
};

export const DlgEbrdMsgEdit = React.forwardRef<Props, unknown>((props, ref) => {
  const [open, setOpen] = useState(false);
  const promise = usePromise<any, any>();
  const [ebrdSeq, setEbrdSeq] = useState<number | undefined>(undefined);
  const [ebrdMsgPos, setEbrdMsgPos] = useState<number | undefined>(undefined);

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
      show: ({ ebrd_seq, ebrd_msg_pos }) => {
        return new Promise((resolve, reject) => {
          promise.current.resolve = resolve;
          promise.current.reject = reject;
          setEbrdSeq(ebrd_seq);
          setEbrdMsgPos(ebrd_msg_pos);
          handleClickOpen();
        });
      },
    })
  );

  return (
    <React.Fragment>
      {/* <BootstrapDialog onClose={handleClose} open={open} $minWidth={400} $minHeight={170}> */}
      <BootstrapDialog onClose={handleClose} open={open} $minWidth={1200} $minHeight={500}>
        <DialogTitle sx={{ m: 0, p: 2, minHeight: 50 }}>전광판 메시지 수정</DialogTitle>
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
        <EbrdMsgEdit ebrd_seq={ebrdSeq} ebrd_msg_pos={ebrdMsgPos} onClose={handleClose} />
      </BootstrapDialog>
    </React.Fragment>
  );
});

DlgEbrdMsgEdit.displayName = 'DlgEbrdMsgEdit';
export const useDlgEbrdMsgEdit = () => useRefComponent<Props>(DlgEbrdMsgEdit);
