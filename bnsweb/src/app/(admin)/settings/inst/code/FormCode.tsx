import { useConfirm } from '@/app/(admin)/comp/popup/DlgConfirm';
import { FormStdTr } from '@/app/(admin)/ndms/comp/FormStdTr';
import { SettingBtn } from '@/app/(admin)/settings/alm/SettingBtn';
import { SettingTitle } from '@/app/(admin)/settings/comp/SettingTitle';
import { IfTbCd, TbCd } from '@/models/comm/tb_cd';
import SettingsIcon from '@mui/icons-material/Settings';
import { Typography } from '@mui/material';
import axios from 'axios';
import { toast } from 'sonner';
import { useSWRConfig } from 'swr';
import {
  StyledCard,
  StyledBox,
  StyledFormTbl,
  StyledCardActions,
} from '@/app/(admin)/settings/comp/StyledForm';
import { Box, SvgIcon } from '@mui/material';

type Props = {
  sel: IfTbCd;
  setSel: (v: IfTbCd) => void;
};

export const FormCode = ({ sel, setSel }: Props) => {
  const { mutate } = useSWRConfig();
  const confirm = useConfirm();

  const handleReset = () => {
    setSel(new TbCd());
  };

  const handleSave = () => {
    if (!sel.cd_grp) {
      toast.error('코드그룹을 입력하여 주십시오');
      return;
    }
    if (!sel.cd) {
      toast.error('코드를 입력하여 주십시오');
      return;
    }
    if (!sel.cd_id) {
      toast.error('코드ID를 입력하여 주십시오');
      return;
    }
    if (!sel.cd_nm) {
      toast.error('코드명을 입력하여 주십시오');
      return;
    }

    const param = { ...sel };

    axios
      .post('/api/cd/save', param)
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

  const handleDelete = () => {
    confirm('확인', ['삭제하시겠습니까'])
      ?.then(() => {
        console.log('삭제 확인. ');
        axios
          .post('/api/cd/delete', sel)
          .then((res) => {
            console.log('res', res.data);
            toast.success('삭제 하였습니다');
            setSel(new TbCd());
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
            코드 등록
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            코드의 정보를 설정합니다.
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
              <FormStdTr
                label='코드그룹'
                value={sel?.cd_grp}
                onChange={(e) => setSel({ ...sel, cd_grp: e })}
              />
              <FormStdTr label='코드' value={sel?.cd} onChange={(e) => setSel({ ...sel, cd: e })} />
              <FormStdTr
                label='코드ID'
                value={sel?.cd_id}
                onChange={(e) => setSel({ ...sel, cd_id: e })}
              />
              <FormStdTr
                label='코드명'
                value={sel?.cd_nm}
                onChange={(e) => setSel({ ...sel, cd_nm: e })}
              />
              <FormStdTr
                label='순서'
                value={sel?.cd_seq}
                onChange={(e) => setSel({ ...sel, cd_seq: parseInt(e) })}
              />
            </tbody>
          </StyledFormTbl>
        </form>
      </Box>

      <StyledCardActions>
        <SettingBtn btnType='save' onClick={handleSave}>
          저장
        </SettingBtn>
        <SettingBtn btnType='reset' onClick={handleReset}>
          초기화
        </SettingBtn>
        <SettingBtn btnType='delete' onClick={handleDelete} disabled={!sel?.cd}>
          삭제
        </SettingBtn>
      </StyledCardActions>
    </StyledCard>
  );
};
