import { DlgBase } from '@/app/(admin)/comp/popup/DlgBase';
import { DlgTitle } from '@/app/(admin)/comp/popup/DlgTitle';
import { SettingBtn } from '@/app/(admin)/settings/alm/SettingBtn';
import { usePromise } from '@/hooks/usePromise';
import { useRefComponent } from '@/hooks/useRefComponent';
import { DialogContent } from '@mui/material';
import DialogActions from '@mui/material/DialogActions';
import 'ol/ol.css';
import * as React from 'react';

export type IfTemplate = {};

type Props = {
  show: () => Promise<IfTemplate>;
};

export const DlgTemplate = React.forwardRef<Props, unknown>((props, ref) => {
  const [open, setOpen] = React.useState(false);
  const promise = usePromise<IfTemplate, { cmd: string; msg?: string }>();

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    promise.current.reject?.({ cmd: 'close' });
  };

  const handleOk = () => {
    setOpen(false);
    //promise.current.resolve?.(ctx.current.pos ? ctx.current.pos : new LatLng());
  };

  React.useImperativeHandle<Props, Props>(
    ref,
    (): Props => ({
      show: () => {
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
      <DlgBase onClose={handleClose} open={open} maxWidth={false} closeAfterTransition={false}>
        <DlgTitle title={'날짜 범위 선택'} handleClose={handleClose} />

        <DialogContent dividers></DialogContent>

        <DialogActions sx={{ margin: 'auto' }}>
          <SettingBtn autoFocus onClick={handleClose} sx={{ minWidth: 100 }} btnType='cancel'>
            취소
          </SettingBtn>
          <SettingBtn autoFocus onClick={handleOk} sx={{ minWidth: 100 }} btnType='confirm'>
            선택
          </SettingBtn>
        </DialogActions>
      </DlgBase>
    </React.Fragment>
  );
});

DlgTemplate.displayName = 'DlgTemplate';
export const useDlgTemplate = () => useRefComponent<Props>(DlgTemplate);
