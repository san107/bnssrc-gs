// @flow
import { useConfirm } from '@/app/(admin)/comp/popup/DlgConfirm';
import { ColGrp } from '@/app/(admin)/comp/table/ColGrp';
import { FormTd, FormTh, FormTr } from '@/app/(admin)/comp/table/FormTbl';
import { SettingBtn } from '@/app/(admin)/settings/alm/SettingBtn';
import { SettingTitle } from '@/app/(admin)/settings/comp/SettingTitle';
import { IfTbGroup, TbGroup } from '@/models/tb_group';
import SettingsIcon from '@mui/icons-material/Settings';
import { Box, MenuItem, Select, SvgIcon, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useSWRConfig } from 'swr';
import { useLoginInfo } from '@/app/(admin)/leftmenu/useLoginInfo';
import {
  StyledCard,
  StyledBox,
  StyledFormTbl,
  StyledCardActions,
} from '@/app/(admin)/settings/comp/StyledForm';

type Props = {
  sel: IfTbGroup;
  setSel: (v: IfTbGroup) => void;
};

export const GroupForm = ({ sel, setSel }: Props) => {
  const { mutate } = useSWRConfig();
  const typeRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const { login } = useLoginInfo();

  const handleReset = () => {
    setSel(new TbGroup());
  };

  useEffect(() => {
    if (!sel.grp_type) {
      setSel({ ...sel, grp_type: typeRef.current?.value });
    }
  }, [sel, setSel]);

  const handleSave = () => {
    if (!sel.grp_nm) {
      toast.error('그룹명을 입력해주세요');
      nameRef.current?.focus();
      return;
    }
    axios
      .post('/api/group/save', { ...sel, grp_id: login?.grp_id })
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
        // console.log('삭제 확인. ');
        axios
          .post('/api/group/delete', sel)
          .then((res) => {
            console.log('res', res.data);
            toast.success('삭제 하였습니다');
            setSel(new TbGroup());
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
            차단장비그룹 설정
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            차단장비그룹의 정보를 설정합니다.
          </Typography>
        </Box>
      </SettingTitle>
      <Box sx={{ mt: 3, flexGrow: 1, overflowY: 'auto' }}>
        <form>
          <StyledFormTbl width={'100%'}>
            <ColGrp cols={[35, 65]} />
            <tbody>
              <FormTr>
                <FormTh>그룹명</FormTh>
                <FormTd>
                  <TextField
                    inputRef={nameRef}
                    fullWidth
                    value={sel?.grp_nm || ''}
                    onChange={(e) => setSel({ ...sel, grp_nm: e.target.value })}
                  />
                </FormTd>
              </FormTr>
              <FormTr>
                <FormTh>타입</FormTh>
                <FormTd>
                  <Select
                    inputRef={typeRef}
                    fullWidth
                    size='small'
                    color='primary'
                    value={sel?.grp_type || 'gate'}
                    onChange={(e) => setSel({ ...sel, grp_type: e.target.value })}
                  >
                    <MenuItem value={'gate'}>차단장비</MenuItem>
                  </Select>
                </FormTd>
              </FormTr>
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
        <SettingBtn btnType='delete' onClick={handleDelete} disabled={!sel?.grp_seq}>
          삭제
        </SettingBtn>
      </StyledCardActions>
    </StyledCard>
  );
};
