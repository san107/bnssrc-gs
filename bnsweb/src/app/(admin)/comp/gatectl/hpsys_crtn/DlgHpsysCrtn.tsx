import { HpsysCrtnCtl } from '@/app/(admin)/comp/gatectl/hpsys_crtn/HpsysCrtn';
import { BootstrapDialog } from '@/app/(admin)/comp/popup/BootstrapDialog';
import { DlgTitle } from '@/app/(admin)/comp/popup/DlgTitle';
import { usePromise } from '@/hooks/usePromise';
import { useRefComponent } from '@/hooks/useRefComponent';
import * as React from 'react';
import { useState } from 'react';

type Props = {
  show: (props: { gateSeq?: number | undefined }) => Promise<{ cmd: string }>;
};

export const DlgHpsysCrtn = React.forwardRef<Props, unknown>((props, ref) => {
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
        <DlgTitle title='HP 커튼형 제어' handleClose={handleClose} />

        <HpsysCrtnCtl gateSeq={open ? gateSeq : undefined} onClose={handleClose} />
      </BootstrapDialog>
    </React.Fragment>
  );
});

DlgHpsysCrtn.displayName = 'DlgHpsysCrtn';
export const useDlgHpsysCrtn = () => useRefComponent<Props>(DlgHpsysCrtn);
