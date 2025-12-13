import { BootstrapDialog } from '@/app/(admin)/comp/popup/BootstrapDialog';
import { DlgTitle } from '@/app/(admin)/comp/popup/DlgTitle';
import { usePromise } from '@/hooks/usePromise';
import { useRefComponent } from '@/hooks/useRefComponent';
import { Box } from '@mui/material';
import * as React from 'react';
import { useState } from 'react';

type Props = {
  show: (props: {}) => Promise<{ cmd: string }>;
};

export const DlgAutogate = React.forwardRef<Props, unknown>((props, ref) => {
  const [open, setOpen] = useState(false);
  const promise = usePromise<any, any>();

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
    })
  );

  return (
    <React.Fragment>
      <BootstrapDialog onClose={handleClose} open={open} $minWidth={800} $minHeight={500}>
        <DlgTitle title='오토게이트 제어' handleClose={handleClose} />
        <Box sx={{ width: '500px', height: '300px' }}>컨텐츠 영역 - DlgEbrdMsgEdit 참조</Box>
      </BootstrapDialog>
    </React.Fragment>
  );
});

DlgAutogate.displayName = 'DlgAutogate';
export const useDlgAutogate = () => useRefComponent<Props>(DlgAutogate);
