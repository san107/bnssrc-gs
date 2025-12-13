import { HpsysCtl } from '@/app/(admin)/comp/gatectl/hpsys/Hpsys';
import { BootstrapDialog } from '@/app/(admin)/comp/popup/BootstrapDialog';
import { DlgTitle } from '@/app/(admin)/comp/popup/DlgTitle';
import { usePromise } from '@/hooks/usePromise';
import { useRefComponent } from '@/hooks/useRefComponent';
import * as React from 'react';
import { useState } from 'react';

type Props = {
  show: (props: { gateSeq?: number | undefined }) => Promise<{ cmd: string }>;
};

export const DlgHpsys = React.forwardRef<Props, unknown>((props, ref) => {
  const [open, setOpen] = useState(false);
  const promise = usePromise<any, any>();
  const [gateSeq, setGateSeq] = useState<number | undefined>(undefined);

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
      show: ({ gateSeq }) => {
        return new Promise((resolve, reject) => {
          promise.current.resolve = resolve;
          promise.current.reject = reject;
          setGateSeq(gateSeq);
          handleClickOpen();
        });
      },
    })
  );

  return (
    <React.Fragment>
      <BootstrapDialog onClose={handleClose} open={open}>
        <DlgTitle title='HP 차단막 제어' handleClose={handleClose} />

        <HpsysCtl gateSeq={open ? gateSeq : undefined} onClose={handleClose} />
      </BootstrapDialog>
    </React.Fragment>
  );
});

DlgHpsys.displayName = 'DlgHpsys';
export const useDlgHpsys = () => useRefComponent<Props>(DlgHpsys);
