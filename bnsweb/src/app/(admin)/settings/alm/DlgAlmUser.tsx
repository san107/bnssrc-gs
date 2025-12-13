/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { ColGrp } from '@/app/(admin)/comp/table/ColGrp';
import { FormTbl, FormTd, FormTh, FormTr } from '@/app/(admin)/comp/table/FormTbl';
import { DialogTitleWithIcon } from '@/app/(admin)/comp/utils/DialogTitleWithIcon';
import { useLoginInfo } from '@/app/(admin)/leftmenu/useLoginInfo';
import { usePromise } from '@/hooks/usePromise';
import { useRefComponent } from '@/hooks/useRefComponent';
import { IfTbAlmUser, TbAlmUser } from '@/models/tb_alm_user';
import { Card, TextField } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import * as React from 'react';
import { useState } from 'react';
import { toast } from 'sonner';
import { mutate } from 'swr';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
    minWidth: 400,
    minHeight: 170,
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(0),
    paddingBottom: theme.spacing(2),
  },
}));

type Props = {
  show: (seq?: number) => Promise<number | undefined>;
};

export const DlgAlmUser = React.forwardRef<Props, unknown>((props, ref) => {
  const [open, setOpen] = React.useState(false);
  const promise = usePromise<number | undefined, any>();
  const [title, setTitle] = React.useState('');
  const [user, setUser] = useState<IfTbAlmUser>(new TbAlmUser());
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const { login } = useLoginInfo();

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    promise.current.reject?.({ cmd: 'close' });
  };

  const handleOk = () => {
    const newErrors: { name?: string; phone?: string } = {};

    if (!user.alm_user_nm || user.alm_user_nm.trim() === '') {
      newErrors.name = '이름을 입력해주세요.';
    }

    if (!user.alm_user_mobile || user.alm_user_mobile.trim() === '') {
      newErrors.phone = '전화번호를 입력해주세요.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    /* 저장하기.
     */
    const userInfo = {
      // ...user,
      alm_user_seq: user.alm_user_seq,
      alm_user_nm: user.alm_user_nm,
      alm_user_dept: user.alm_user_dept || '', // 빈 문자열로 기본값 설정
      alm_user_mobile: user.alm_user_mobile,
      grp_id: login.grp_id,
    };
    axios
      .post('/api/alm_user/save', userInfo)
      .then((res) => {
        console.log('res', res.data);
        toast.success('저장 하였습니다.');
        setOpen(false);
        promise.current.resolve?.(user.alm_user_seq);
        mutate(() => true);
      })
      .catch((e) => {
        console.error('E', e);
        toast.error('실패 하였습니다.' + e.message);
      });
  };

  React.useImperativeHandle<Props, Props>(
    ref,
    (): Props => ({
      show: (seq?: number) => {
        return new Promise((resolve, reject) => {
          promise.current.resolve = resolve;
          promise.current.reject = reject;
          setErrors({}); // 에러 상태 초기화

          if (seq) {
            setTitle('알람 사용자 수정');
            // 불러오기.
            axios
              .get('/api/alm_user/one', { params: { almUserSeq: seq } })
              .then((res) => setUser(res.data))
              .catch((e) => {
                console.error('E', e);
                setTitle('알람 사용자 등록');
                setUser(new TbAlmUser());
              });
          } else {
            setTitle('알람 사용자 등록');
            setUser(new TbAlmUser());
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
                <FormTh>이름 *</FormTh>
                <FormTd>
                  <TextField
                    fullWidth
                    required
                    error={!!errors.name}
                    helperText={errors.name}
                    value={user?.alm_user_nm || ''}
                    onChange={(e) => {
                      setUser({ ...user, alm_user_nm: e.target.value });
                      if (errors.name) {
                        setErrors({ ...errors, name: undefined });
                      }
                    }}
                  />
                </FormTd>
              </FormTr>
              <FormTr>
                <FormTh>부서</FormTh>
                <FormTd>
                  <TextField
                    fullWidth
                    value={user?.alm_user_dept || ''}
                    onChange={(e) => setUser({ ...user, alm_user_dept: e.target.value })}
                  />
                </FormTd>
              </FormTr>
              <FormTr>
                <FormTh>전화번호 *</FormTh>
                <FormTd>
                  <TextField
                    fullWidth
                    required
                    error={!!errors.phone}
                    helperText={errors.phone}
                    value={user?.alm_user_mobile || ''}
                    onChange={(e) => {
                      setUser({ ...user, alm_user_mobile: e.target.value });
                      if (errors.phone) {
                        setErrors({ ...errors, phone: undefined });
                      }
                    }}
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

DlgAlmUser.displayName = 'DlgAlmUser';
export const useDlgAlmUser = () => useRefComponent<Props>(DlgAlmUser);
