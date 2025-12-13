import React, { useRef } from 'react';
import { Box, Button, Grid, TextField } from '@mui/material';
import { IfTbGate } from '@/models/gate/tb_gate';
import axios from 'axios';
import { toast } from 'sonner';
import { useSWRConfig } from 'swr';
import { useLoginInfo } from '@/app/(admin)/leftmenu/useLoginInfo';

type Props = {
  groups?: IfTbGate[];
};

const NotiGroupForm = ({ groups }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutate } = useSWRConfig();
  const { login } = useLoginInfo();

  const hideNotiForm = () => {
    const notification = document.getElementById('form-group-container');
    if (notification) notification?.classList.remove('show');
  };

  const handleClickSave = (_e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    // console.log('groups', groups);
    if (!inputRef.current?.value) {
      inputRef.current?.focus();
      return;
    }
    axios
      .post('/api/group/savewithel', {
        list: groups,
        grp_nm: inputRef.current?.value,
        grp_type: 'gate',
        grp_id: login?.grp_id,
      })
      .then(() => {
        toast.success('저장하였습니다');
        mutate(() => true);
        hideNotiForm();
      })
      .catch((e) => {
        console.error('E', e);
        toast.error('실패하였습니다.(error : ' + e?.message + ')');
      });
  };

  return (
    <div className='form-group-container' id='form-group-container'>
      <div className='noti-group-header'>
        <span className='icon icon-close2' id='notification-close' onClick={hideNotiForm}></span>
        차단장비 그룹 등록
      </div>
      <Grid container spacing={1}>
        <Grid size={12}>
          <span className='comment'>그룹명을 입력하시고 저장 버튼을 누르시면 등록이 됩니다.</span>
        </Grid>
      </Grid>
      <Box sx={{ display: 'flex', padding: '20px', justifyContent: 'center' }}>
        <TextField fullWidth size='small' label='그룹명을 입력하세요.' inputRef={inputRef} />
        <Button color='error' onClick={(e) => handleClickSave(e)}>
          저장
        </Button>
      </Box>
    </div>
  );
};

export default NotiGroupForm;
