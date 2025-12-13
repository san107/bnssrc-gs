import { IfTbAlmUser } from '@/models/tb_alm_user';
import { Box, Button, TextField } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import axios from 'axios';
import React, { useMemo, useRef } from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';

const NotiSmsForm = () => {
  const { data: users } = useSWR<IfTbAlmUser[]>(['/api/alm_user/list']);
  const inputRef = useRef<HTMLInputElement>(null);
  const [selUsers, setSelUsers] = React.useState([]);

  const selectedUsers = useMemo(() => {
    let value = '';
    (users || []).map((item) => {
      if (selUsers.some((selId: any) => selId === item?.alm_user_mobile)) {
        if (value) {
          value += ', ' + item?.alm_user_nm;
        } else {
          value = item?.alm_user_nm || '';
        }
      }
    });
    return value;
  }, [users, selUsers]);

  const hideNotiForm = () => {
    const notification = document.getElementById('form-sms-container');
    if (notification) notification?.classList.remove('show');
    if (notification) notification?.classList.add('hide');
    setSelUsers([]);
  };

  const handleClickSend = (_e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    // console.log('groups', groups);
    if (!inputRef.current?.value) {
      inputRef.current?.focus();
      return;
    }

    const from = '01023777174'; // 발신자 (테스트번호)
    const to = selUsers[0]; // 수신자 (테스트용 1명만)
    const msg = inputRef.current?.value; // 메시지내용

    console.log('from', from);
    console.log('to', to);
    console.log('msg', msg);
    const param = {
      msg,
      tos: selUsers,
    };

    axios
      .post('/api/sms/send_info', param)
      .then((res) => {
        console.log('', res.data);
        toast.success('SMS전송요청하였습니다.');
      })
      .catch((e) => {
        console.error('에러', e);
        toast.error('실패하였습니다');
      });
  };

  return (
    <div className='form-sms-container' id='form-sms-container'>
      <div className='noti-sms-header'>
        <span
          className='icon icon-small-close'
          id='notification-close'
          onClick={hideNotiForm}
        ></span>
        SMS 전송
      </div>
      <Box sx={{ padding: '10px' }} />
      <Box sx={{ padding: '20px' }}>
        <FormControl fullWidth>
          <InputLabel id='multiple-checkbox-label' sx={{ marginTop: '-7px' }}>
            담당자선택
          </InputLabel>
          <Select
            labelId='multiple-checkbox-label'
            id='demo-multiple-checkbox'
            multiple
            value={selUsers}
            onChange={(event: any) => {
              const {
                target: { value },
              } = event;
              setSelUsers(value);
            }}
            input={<OutlinedInput label='Tag' />}
            renderValue={() => selectedUsers}
          >
            {(users || []).map((item) => (
              <MenuItem key={item?.alm_user_seq} value={item?.alm_user_mobile}>
                <Checkbox
                  checked={selUsers.some((selId: any) => selId === item?.alm_user_mobile)}
                />
                <ListItemText primary={item?.alm_user_nm} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Box sx={{ display: 'flex', padding: '20px' }}>
        <TextField
          fullWidth
          size='small'
          label='내용을 입력하세요.'
          inputRef={inputRef}
          multiline
          rows={4}
        />
        <Button color='error' onClick={(e) => handleClickSend(e)}>
          전송
        </Button>
      </Box>
    </div>
  );
};

export default NotiSmsForm;
