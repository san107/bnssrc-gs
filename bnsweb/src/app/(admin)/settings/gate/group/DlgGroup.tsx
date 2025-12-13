/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { BootstrapDialog } from '@/app/(admin)/comp/popup/BootstrapDialog';
import { ColGrp } from '@/app/(admin)/comp/table/ColGrp';
import { FormTbl, FormTd, FormTh, FormTr } from '@/app/(admin)/comp/table/FormTbl';
import { DialogTitleWithIcon } from '@/app/(admin)/comp/utils/DialogTitleWithIcon';
import { useLoginInfo } from '@/app/(admin)/leftmenu/useLoginInfo';
import { usePromise } from '@/hooks/usePromise';
import { useRefComponent } from '@/hooks/useRefComponent';
import { IfTbGroup, TbGroup } from '@/models/tb_group';
import { Card, TextField } from '@mui/material';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import axios from 'axios';
import * as React from 'react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useSWRConfig } from 'swr';

type Props = {
  show: (seq?: number) => Promise<number | undefined>;
};

export const DlgGroup = React.forwardRef<Props, unknown>((props, ref) => {
  const [open, setOpen] = React.useState(false);
  const promise = usePromise<number | undefined, { cmd: string }>();
  const [title, setTitle] = React.useState('');
  //const [user, setUser] = useState<IfTbAlmUser>(new TbAlmUser());
  const { login } = useLoginInfo();

  const { mutate } = useSWRConfig();

  const [sel, setSel] = useState<IfTbGroup>(new TbGroup());

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    promise.current.reject?.({ cmd: 'close' });
  };

  const handleOk = () => {
    /* 저장하기.
     */
    if (!sel.grp_nm) {
      toast.error('그룹명을 입력해주세요');
      return;
    }
    console.log('handleOk', sel);
    axios
      .post('/api/group/save', { ...sel, grp_type: 'gate', grp_id: login?.grp_id })
      .then((res) => {
        setSel(res.data);
        toast.success('저장하였습니다');
        mutate(() => true);
        handleClose();
      })
      .catch((e) => {
        console.error('E', e);
        toast.error('실패하였습니다.(error : ' + e?.message + ')');
      });
  };

  React.useImperativeHandle<Props, Props>(
    ref,
    (): Props => ({
      show: (seq?: number) => {
        return new Promise((resolve, reject) => {
          promise.current.resolve = resolve;
          promise.current.reject = reject;
          if (seq) {
            setTitle('차단장비 그룹 수정');
            // 불러오기.
            axios
              .get('/api/group/one', { params: { grpSeq: seq } })
              .then((res) => setSel(res.data))
              .catch((e) => {
                console.error('E', e);
                setSel(new TbGroup());
              });
          } else {
            setTitle('차단장비 그룹 등록');
            setSel(new TbGroup());
          }

          handleClickOpen();
        });
      },
    })
  );

  return (
    <React.Fragment>
      <BootstrapDialog
        onClose={handleClose}
        open={open}
        maxWidth={false}
        closeAfterTransition={false}
      >
        <DialogTitleWithIcon title={title} handleClose={handleClose} />

        <Card
          elevation={0}
          sx={{ width: '400px', padding: 2 }}
          css={css`
            &.MuiCard-root {
              padding-top: 0;
            }
          `}
        >
          <FormTbl width={'100%'}>
            <ColGrp cols={[1, 2]} />
            <tbody>
              <FormTr>
                <FormTh>그룹명</FormTh>
                <FormTd>
                  <TextField
                    fullWidth
                    value={sel?.grp_nm || ''}
                    onChange={(e) => setSel({ ...sel, grp_nm: e.target.value })}
                  />
                </FormTd>
              </FormTr>
            </tbody>
          </FormTbl>
        </Card>

        <DialogActions sx={{ margin: 'auto' }}>
          <Button onClick={handleClose} sx={{ minWidth: 100 }} color='secondary'>
            취소
          </Button>
          <Button autoFocus onClick={handleOk} sx={{ minWidth: 100 }} color='primary'>
            저장
          </Button>
        </DialogActions>
      </BootstrapDialog>
    </React.Fragment>
  );
});

DlgGroup.displayName = 'DlgGroup';
export const useDlgGroup = () => useRefComponent<Props>(DlgGroup);
