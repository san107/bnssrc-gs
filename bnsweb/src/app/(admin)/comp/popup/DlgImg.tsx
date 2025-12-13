import { BootstrapDialog } from '@/app/(admin)/comp/popup/BootstrapDialog';
import { DlgTitle } from '@/app/(admin)/comp/popup/DlgTitle';
import { usePromise } from '@/hooks/usePromise';
import { useRefComponent } from '@/hooks/useRefComponent';
import { Box } from '@mui/material';
import * as React from 'react';
import { useState } from 'react';

type Props = {
  show: (props: { file_seq?: number | undefined }) => Promise<{ cmd: string }>;
};

export const DlgImg = React.forwardRef<Props, unknown>((props, ref) => {
  const [open, setOpen] = useState(false);
  const promise = usePromise<any, any>();
  const [fileSeq, setFileSeq] = useState<number | undefined>(undefined);

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
      show: ({ file_seq }) => {
        return new Promise((resolve, reject) => {
          promise.current.resolve = resolve;
          promise.current.reject = reject;
          setFileSeq(file_seq);
          handleClickOpen();
        });
      },
    })
  );

  return (
    <React.Fragment>
      <BootstrapDialog onClose={handleClose} open={open}>
        <DlgTitle title='이미지 상세보기' handleClose={handleClose} />

        <Box>
          <img
            src={`/api/file/download_nocache?fileSeq=${fileSeq}&key=${new Date().getTime()}`}
            alt='이미지'
          />
        </Box>
      </BootstrapDialog>
    </React.Fragment>
  );
});

DlgImg.displayName = 'DlgImg';
export const useDlgImg = () => useRefComponent<Props>(DlgImg);
