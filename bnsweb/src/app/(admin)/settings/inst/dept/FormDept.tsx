// @flow
import { FormTd, FormTh, FormTr } from '@/app/(admin)/comp/table/FormTbl';
import { SettingBtn } from '@/app/(admin)/settings/alm/SettingBtn';
import { SettingTitle } from '@/app/(admin)/settings/comp/SettingTitle';
import { IfTbGrp, TbGrp } from '@/models/tb_grp';
import SettingsIcon from '@mui/icons-material/Settings';
import { Alert, Box, TextField, Typography } from '@mui/material';
import {
  StyledCard,
  StyledBox,
  StyledFormTbl,
  StyledCardActions,
} from '@/app/(admin)/settings/comp/StyledForm';
import { SvgIcon } from '@mui/material';
import { useConfirm } from '@/app/(admin)/comp/popup/DlgConfirm';
import axios from 'axios';
import { toast } from 'sonner';
import useSWR from 'swr';
import { useSWRConfig } from 'swr';
import { useGrpDepth, useLoginInfo } from '@/app/(admin)/leftmenu/useLoginInfo';
import { get_err_msg } from '@/utils/err-util';

type Props = {
  sel: IfTbGrp;
  setSel: (v: IfTbGrp) => void;
};

export const FormDept = ({ sel, setSel }: Props) => {
  const { data: exist } = useSWR(sel?.grp_id ? [`/api/grp/one?grpId=${sel?.grp_id}`] : undefined);
  const { mutate } = useSWRConfig();
  const grpDepth = useGrpDepth();

  const handleReset = () => {
    setSel(new TbGrp());
  };

  const { login } = useLoginInfo();

  const handleSave = (action: 'add' | 'edit') => {
    const param = { ...sel, p_grp_id: login?.grp_id };

    // 신규등록인 경우에 중복 체크
    if (action === 'add') {
      if (!param.grp_id) {
        toast.warning('부서 ID를 입력하세요.');
        return;
      }
      axios
        .get(`/api/grp/one?grpId=${param.grp_id}`)
        .then((res) => {
          if (res.data) {
            toast.warning('이미 존재하는 부서 ID입니다.');
            return;
          }
          saveGrp(param);
        })
        .catch((e) => {
          console.error('E', e);
        });
    } else {
      // 수정인 경우 바로 저장
      saveGrp(param);
    }
  };

  const saveGrp = (param: IfTbGrp & { p_grp_id?: string }) => {
    axios
      .post('/api/grp/save', param)
      .then((res) => {
        setSel(res.data);
        toast.success('저장하였습니다', { position: 'bottom-right' });
        mutate(() => true);
      })
      .catch((e) => {
        console.error('E', e);
        toast.error('실패하였습니다.(error : ' + get_err_msg(e) + ')', {
          position: 'bottom-right',
        });
      });
  };

  const confirm = useConfirm();
  const handleDelete = () => {
    confirm('확인', ['삭제하시겠습니까'])
      ?.then(() => {
        // console.log('삭제 확인. ');
        axios
          .post('/api/grp/delete', sel)
          .then((res) => {
            console.log('res', res.data);
            toast.success('삭제 하였습니다', { position: 'bottom-right' });
            setSel(new TbGrp());
            mutate(() => true);
          })
          .catch((e) => {
            console.error('E', e);
            toast.error('실패하였습니다(' + get_err_msg(e) + ')', {
              position: 'bottom-right',
            });
          });
      })
      .catch((e) => {
        // 취소
        console.log('취소. ', e);
      });
  };

  return (
    <StyledCard>
      <SettingTitle>
        <StyledBox>
          <SvgIcon fontSize='large'>
            <SettingsIcon />
          </SvgIcon>
        </StyledBox>
        <Box>
          <Typography variant='h5' fontWeight={700} color='text.primary'>
            부서 관리
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            부서의 정보를 설정합니다.
          </Typography>
        </Box>
      </SettingTitle>

      <Box sx={{ mt: 3, flexGrow: 1, overflowY: 'auto' }}>
        <Alert severity='info' sx={{ mb: 2 }}>
          부서 ID는 키 값이므로 변경 시 신규등록으로 처리됩니다.
        </Alert>
        <form>
          <StyledFormTbl width={'100%'}>
            <colgroup>
              <col width={'35%'} />
              <col width={'65%'} />
            </colgroup>
            <tbody>
              <FormTr>
                <FormTh>부서 ID</FormTh>
                <FormTd>
                  <TextField
                    fullWidth
                    value={sel?.grp_id || ''}
                    onChange={(e) => setSel({ ...sel, grp_id: e.target.value })}
                  />
                </FormTd>
              </FormTr>
              <FormTr>
                <FormTh>부서명</FormTh>
                <FormTd>
                  <TextField
                    fullWidth
                    value={sel?.grp_nm || exist?.grp_nm || ''}
                    onChange={(e) => setSel({ ...sel, grp_nm: e.target.value })}
                  />
                </FormTd>
              </FormTr>
              <FormTr>
                <FormTh>부서 설명</FormTh>
                <FormTd>
                  <TextField
                    fullWidth
                    value={sel?.grp_desc || exist?.grp_desc || ''}
                    onChange={(e) => setSel({ ...sel, grp_desc: e.target.value })}
                  />
                </FormTd>
              </FormTr>
            </tbody>
          </StyledFormTbl>
        </form>
      </Box>

      <StyledCardActions>
        <SettingBtn
          btnType='add'
          onClick={() => handleSave('add')}
          disabled={
            (grpDepth > 1 && login?.grp_id !== sel?.grp_id) ||
            (exist && !(grpDepth > 1 && login?.grp_id !== sel?.grp_id))
          }
        >
          신규등록
        </SettingBtn>
        <SettingBtn
          btnType='edit'
          onClick={() => handleSave('edit')}
          disabled={!exist || (grpDepth > 1 && login?.grp_id !== sel?.grp_id)}
        >
          수정
        </SettingBtn>
        <SettingBtn btnType='reset' onClick={handleReset}>
          초기화
        </SettingBtn>
        <SettingBtn
          btnType='delete'
          onClick={handleDelete}
          disabled={!exist || sel?.grp_id === login?.grp_id}
        >
          삭제
        </SettingBtn>
      </StyledCardActions>
    </StyledCard>
  );
};
