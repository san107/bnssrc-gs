import useColor from '@/hooks/useColor';
import { IfTbAlmUser } from '@/models/tb_alm_user';
import { IfTbMsg } from '@/models/tb_msg';
import { Box, Button, TextField, IconButton, SvgIcon } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import axios from 'axios';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import useSWR, { useSWRConfig } from 'swr';
import { MdDeleteForever } from 'react-icons/md';
import { useConfirm } from '@/app/(admin)/comp/popup/DlgConfirm';

type Props = {
  sel?: string;
  callback?: (msg: string) => void;
};

const MsgListView = ({ sel, callback }: Props) => {
  const { data: list, mutate } = useSWR<IfTbMsg[]>(['/api/msg/list']);
  const [selMsg, setSelMsg] = useState<string>();
  const { selColor, hovColor } = useColor(); // color 설정
  const confirm = useConfirm();

  useEffect(() => {
    setSelMsg(sel);
  }, [sel]);

  const handleClickDelete = (e: React.MouseEvent, msg: IfTbMsg) => {
    e.preventDefault();
    e.stopPropagation();

    confirm('확인', ['메시지를 삭제하시겠습니까?'])
      ?.then(() => {
        // 삭제 처리.
        axios
          .post('/api/msg/delete', msg)
          .then((res) => {
            console.log('res', res.data);
            mutate();
            toast.success('삭제하였습니다');
          })
          .catch((e) => {
            console.error('E', e);
            toast.error('삭제에 실패하였습니다');
          });
      })
      .catch((e) => {
        // 취소
        console.log('취소. ', e);
      });
  };

  return (
    <div className='msg-list-container' id='msg-list-container'>
      <div className='msg-list-header'>메시지 목록</div>
      <Box sx={{ padding: '20px 20px 0px 20px' }}>
        <Box className='msg-list-body'>
          {(list || []).map((item) => (
            <MenuItem
              key={item?.msg_seq}
              value={item?.msg_txt}
              sx={{
                backgroundColor: item?.msg_txt === selMsg ? selColor : '#27293D',
                color: '#fff',
                borderBottom: '1px solid #3C3E5C',
                '&:hover {': {
                  backgroundColor: hovColor,
                },
              }}
              onClick={(e: any) => {
                e.preventDefault();
                setSelMsg(e.target.innerText);
                if (callback) callback(e.target.innerText);
              }}
            >
              <ListItemText primary={item?.msg_txt} className='limit-line' />
              &nbsp;
              <IconButton
                aria-label='delete'
                size='small'
                onClick={(e) => handleClickDelete(e, item)}
              >
                <SvgIcon>
                  <MdDeleteForever color='#fff' />
                </SvgIcon>
              </IconButton>
            </MenuItem>
          ))}
        </Box>
      </Box>
    </div>
  );
};

const NotiSmsForm = () => {
  const { data: users } = useSWR<IfTbAlmUser[]>(['/api/alm_user/list']);
  const inputRef = useRef<HTMLInputElement>(null);
  const [selUsers, setSelUsers] = React.useState([]);
  const [selMsg, setSelMsg] = React.useState<string>('');
  const [viewList, setViewList] = React.useState<boolean>(false);
  const { button, lineColor, selColor, hovColor } = useColor(); // color 설정
  const { mutate } = useSWRConfig();

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

  const setMessage = (msg: string) => {
    setSelMsg(msg);
  };

  const hideNotiForm = () => {
    if (viewList) {
      handleClickListView();
    }
    const notification = document.getElementById('form-sms-container');
    if (notification) notification?.classList.remove('show');
    if (notification) notification?.classList.add('hide');
    setSelUsers([]);
    setSelMsg('');
  };

  const handleClickListView = () => {
    setViewList(!viewList);
    const notification = document.getElementById('msg-list-container');
    if (viewList) {
      if (notification) notification?.classList.remove('show');
      if (notification) notification?.classList.add('hide');
    } else {
      if (notification) notification?.classList.remove('hide');
      if (notification) notification?.classList.add('show');
    }
  };

  const handleClickSave = () => {
    if (!inputRef.current?.value) {
      inputRef.current?.focus();
      toast.info('저장할 메시지를 입력해주세요.');
      return;
    }
    const param: IfTbMsg = { msg_txt: inputRef.current?.value };
    axios
      .post('/api/msg/save', param)
      .then((res) => {
        console.log('res is ', res.data);
        toast.success('메시지를 저장하였습니다');
        // list mutate.
        mutate((key) => {
          if (Array.isArray(key)) {
            console.log('key', key);
            if (key?.[0].startsWith('/api/msg/list')) {
              return true;
            }
          }
          return false;
        });
      })
      .catch((e) => {
        console.error('E', e);
        toast.error('실패하였습니다.(error : ' + e?.message + ')');
      });
  };

  const handleClickSend = (_e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (!inputRef.current?.value) {
      inputRef.current?.focus();
      return;
    }
    if (selUsers.length === 0) {
      toast.info('담당자를 선택해주세요.');
      return;
    }

    const msg = inputRef.current?.value; // 메시지내용
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
    <>
      <MsgListView sel={selMsg} callback={setMessage} />
      <div className='form-sms-container' id='form-sms-container'>
        <div className='form-sms-header'>
          <span
            className='icon icon-small-close'
            id='notification-close'
            onClick={hideNotiForm}
          ></span>
          SMS 전송
        </div>
        <Box sx={{ padding: '20px 20px 0px 20px' }}>
          <FormControl fullWidth>
            <InputLabel id='multiple-checkbox-label' sx={{ marginTop: '-5px', color: '#a9a9a9' }}>
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
              sx={{
                height: 30,
                marginTop: '8px',
                color: '#a9a9a9',
                backgroundColor: '#27293d',
                border: '1px solid #696969',
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'transparent',
                },
                '.MuiSvgIcon-root': {
                  color: '#a9a9a9',
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    '& .MuiList-root': {
                      color: '#a9a9a9',
                      backgroundColor: '#3c3e5c',
                    },
                    '& .MuiMenuItem-root.Mui-selected': {
                      backgroundColor: selColor,
                    },
                    '& .MuiMenuItem-root:hover': {
                      backgroundColor: hovColor,
                    },
                  },
                },
              }}
            >
              {(users || []).map((item) => (
                <MenuItem key={item?.alm_user_seq} value={item?.alm_user_mobile}>
                  <Checkbox
                    checked={selUsers.some((selId: any) => selId === item?.alm_user_mobile)}
                    sx={{ color: lineColor }}
                  />
                  <ListItemText primary={item?.alm_user_nm} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ padding: '10px 20px 0px 20px' }}>
          <Button className={`btn btn-sm ${button}`} onClick={() => handleClickListView()}>
            메시지 선택
          </Button>
          &nbsp;
          <Button className={`btn btn-sm ${button}`} onClick={() => handleClickSave()}>
            메시지 저장
          </Button>
        </Box>
        <Box sx={{ display: 'flex', padding: '20px' }}>
          <TextField
            fullWidth
            size='small'
            // label='내용을 입력하세요.'
            inputRef={inputRef}
            multiline
            value={selMsg}
            rows={4}
            sx={{
              '& .MuiInputBase-input': {
                color: '#a9a9a9',
              },
              '& .MuiFormLabel-root': {
                color: '#a9a9a9',
              },
              '& label.Mui-focused': {
                color: '#a9a9a9',
              },
              backgroundColor: '#27293d',
              border: '1px solid #696969',
            }}
            onChange={(event: any) => {
              const {
                target: { value },
              } = event;
              setSelMsg(value);
            }}
          />
          <Button className={`btn btn-sm ${button}`} onClick={(e) => handleClickSend(e)}>
            전송
          </Button>
        </Box>
      </div>
    </>
  );
};

export default NotiSmsForm;
