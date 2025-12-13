// @flow
import { CdIdCombo } from '@/app/(admin)/comp/input/CdIdCombo';
import { GrpCombo } from '@/app/(admin)/comp/input/GrpCombo';
import { useConfirm } from '@/app/(admin)/comp/popup/DlgConfirm';
import { FormTd, FormTh, FormTr } from '@/app/(admin)/comp/table/FormTbl';
import { useLoginInfo, useLoginRole } from '@/app/(admin)/leftmenu/useLoginInfo';
import { SettingBtn } from '@/app/(admin)/settings/alm/SettingBtn';
import { SettingTitle } from '@/app/(admin)/settings/comp/SettingTitle';
import {
  StyledCard,
  StyledBox,
  StyledFormTbl,
  StyledCardActions,
} from '@/app/(admin)/settings/comp/StyledForm';
import { IfTbLogin, TbLogin } from '@/models/tb_login';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { Box, SvgIcon, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { toast } from 'sonner';
import { useSWRConfig } from 'swr';

type Props = {
  sel: IfTbLogin;
  setSel: (v: IfTbLogin) => void;
  edit: boolean;
  setEdit: (v: boolean) => void;
  list: IfTbLogin[] | undefined;
};

export const FormUser = ({ sel, setSel, edit, setEdit, list }: Props) => {
  const { mutate } = useSWRConfig();

  const handleReset = () => {
    setSel(new TbLogin());
    setEdit(false);
  };

  const handleSave = () => {
    const param = { ...sel };
    if (!param.user_pass) {
      param.user_pass = undefined;
    }
    if (!edit) {
      if ((list || []).find((v) => v.user_id === param.user_id)) {
        toast.error('이미 등록된 아이디 입니다.');
        return;
      }
    }
    axios
      .post('/api/login/save', param)
      .then((res) => {
        setSel(res.data);
        toast.success('저장하였습니다');
        mutate(() => true);
      })
      .catch((e) => {
        console.error('E', e);
        toast.error('실패하였습니다.(error : ' + e?.message + ')');
      });
  };

  const confirm = useConfirm();
  const handleDelete = () => {
    confirm('확인', ['삭제하시겠습니까'])
      ?.then(() => {
        console.log('삭제 확인. ');
        axios
          .post('/api/login/delete', sel)
          .then((res) => {
            console.log('res', res.data);
            toast.success('삭제 하였습니다');
            setSel(new TbLogin());
            mutate(() => true);
          })
          .catch((e) => {
            console.error('E', e);
            toast.error('실패하였습니다(' + e?.message + ')');
          });
      })
      .catch((e) => {
        // 취소
        console.log('취소. ', e);
      });
  };

  const { hasAuth } = useLoginRole();

  const { login } = useLoginInfo();
  return (
    <StyledCard>
      <SettingTitle>
        <StyledBox>
          <SvgIcon fontSize='large'>
            <ManageAccountsIcon />
          </SvgIcon>
        </StyledBox>
        <Box>
          <Typography variant='h5' fontWeight={700} color='text.primary'>
            계정 설정
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            사용자 계정의 정보를 설정합니다.
          </Typography>
        </Box>
      </SettingTitle>

      <Box sx={{ mt: 3, flexGrow: 1, overflowY: 'auto' }}>
        <form>
          <StyledFormTbl width={'100%'}>
            <colgroup>
              <col width={'35%'} />
              <col width={'65%'} />
            </colgroup>
            <tbody>
              <FormTr>
                <FormTh>아이디</FormTh>
                <FormTd sx={{ pr: 3 }}>
                  <TextField
                    fullWidth
                    size='small'
                    disabled={edit}
                    value={sel?.user_id || ''}
                    onChange={(e) => setSel({ ...sel, user_id: e.target.value })}
                  />
                </FormTd>
              </FormTr>
              <FormTr>
                <FormTh>이름</FormTh>
                <FormTd sx={{ pr: 3 }}>
                  <TextField
                    fullWidth
                    size='small'
                    value={sel?.user_name || ''}
                    onChange={(e) => setSel({ ...sel, user_name: e.target.value })}
                  />
                </FormTd>
              </FormTr>

              <FormTr>
                <FormTh>이메일</FormTh>
                <FormTd sx={{ pr: 3 }}>
                  <TextField
                    fullWidth
                    size='small'
                    value={sel?.user_email || ''}
                    onChange={(e) => setSel({ ...sel, user_email: e.target.value })}
                  />
                </FormTd>
              </FormTr>
              <FormTr>
                <FormTh>권한</FormTh>
                <FormTd sx={{ pr: 3 }}>
                  <CdIdCombo
                    value={sel?.user_role || ''}
                    grp='UR'
                    without={login?.user_role === 'Inst' ? [] : ['Inst']}
                    onChange={(e) => setSel({ ...sel, user_role: e.target.value as any })}
                  />
                </FormTd>
              </FormTr>
              <FormTr>
                <FormTh>패스워드</FormTh>
                <FormTd sx={{ pr: 3 }}>
                  <TextField
                    fullWidth
                    size='small'
                    type='password'
                    value={sel?.user_pass || ''}
                    onChange={(e) => setSel({ ...sel, user_pass: e.target.value })}
                  />
                </FormTd>
              </FormTr>
              <FormTr>
                <FormTh>부서</FormTh>
                <FormTd sx={{ pr: 3 }}>
                  <GrpCombo
                    value={sel?.grp_id || ''}
                    onChange={(e) => setSel({ ...sel, grp_id: e.target.value })}
                  />
                </FormTd>
              </FormTr>
            </tbody>
          </StyledFormTbl>
        </form>
      </Box>

      <StyledCardActions>
        <SettingBtn btnType='save' onClick={handleSave} disabled={!hasAuth(sel?.user_role)}>
          저장
        </SettingBtn>
        <SettingBtn btnType='reset' onClick={handleReset}>
          초기화
        </SettingBtn>
        <SettingBtn
          btnType='delete'
          onClick={handleDelete}
          disabled={!sel?.user_id || !hasAuth(sel?.user_role)}
        >
          삭제
        </SettingBtn>
      </StyledCardActions>
    </StyledCard>
  );
};
