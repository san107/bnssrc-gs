'use client';
// @flow
import { useConfirm } from '@/app/(admin)/comp/popup/DlgConfirm';
import { useLoginInfo } from '@/app/(admin)/leftmenu/useLoginInfo';
import { SettingBtn } from '@/app/(admin)/settings/alm/SettingBtn';
import { SettingTitle } from '@/app/(admin)/settings/comp/SettingTitle';
import { StyledBox, StyledCard, StyledCardActions } from '@/app/(admin)/settings/comp/StyledForm';
import { EbrdEditor } from '@/app/(admin)/settings/ebrd/comp/EbrdEditor';
import { EbrdMsgTbl } from '@/app/(admin)/settings/ebrd/msg/EbrdMsgTbl';
import { IfTbEbrd, TbEbrd } from '@/models/ebrd/tb_ebrd';
import { IfTbEbrdMsg, TbEbrdMsg } from '@/models/ebrd/tb_ebrd_msg';
import { dateutil } from '@/utils/date-util';
import { get_err_msg } from '@/utils/err-util';
import { swrMutator } from '@/utils/swr-provider';
import SettingsIcon from '@mui/icons-material/Settings';
import {
  Box,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  SvgIcon,
  Typography,
} from '@mui/material';
import axios from 'axios';
import domtoimage from 'dom-to-image';
import { convert } from 'html-to-text';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useSWRConfig } from 'swr';
import useSWRMutation from 'swr/mutation';

type Props = {
  sel: IfTbEbrd;
  setSel: (v: IfTbEbrd) => void;
};

export const EbrdMsg = ({ sel, setSel }: Props) => {
  const { mutate } = useSWRConfig();
  const [ebrdMsg, setEbrdMsg] = useState(new TbEbrdMsg());
  const [msgFile, setMsgFile] = useState<File | null>(null);
  const { login } = useLoginInfo();

  const [savedMsg, setSavedMsg] = useState<IfTbEbrdMsg | null>(null);
  const [savedMaps, setSavedMaps] = useState<[number, number][]>([]);

  useEffect(() => {
    setSavedMsg(null);
    setSavedMaps([]);
  }, [sel?.ebrd_seq]);

  useEffect(() => {
    setEbrdMsg(new TbEbrdMsg());
  }, [sel?.ebrd_type]);

  useEffect(() => {
    setMsgFile(null);
    const file = document.getElementById('file-upload') as HTMLInputElement;
    if (file) {
      file.value = '';
    }
  }, [ebrdMsg?.ebrd_msg_type]);

  const handleReset = () => {
    setEbrdMsg(new TbEbrdMsg());
  };

  // const getEditorImage = async () => {
  //   domtoimage.toBlob(document.getElementById('my-node'));
  // };

  const handleNewSave = async () => {
    if (!sel?.ebrd_seq) {
      toast.error('전광판을 선택하세요', { position: 'bottom-right' });
      return;
    }
    const msg = { ...ebrdMsg };
    msg.ebrd_size_h = sel?.ebrd_size_h;
    msg.ebrd_size_w = sel?.ebrd_size_w;
    if (msg.ebrd_msg_type === 'Text' && msg.start_efct !== 16) {
      if (!msg.ebrd_msg_html) {
        toast.error('메시지를 입력하여 주십시오', { position: 'bottom-right' });
        return;
      }
      msg.ebrd_msg_text = convert(ebrdMsg?.ebrd_msg_html) || '';
    } else {
      msg.ebrd_msg_text = msg.ebrd_msg_text || '';
      msg.ebrd_msg_html = msg.ebrd_msg_html || '';
    }

    msg.ebrd_msg_seq = -1;
    if (!msg.file_seq) msg.file_seq = -1;
    msg.update_user_id = login?.user_id || '';
    msg.update_dt = new Date().toISOString().substring(0, 19);

    const formData = new FormData();

    if (msg.ebrd_msg_type === 'Text') {
      const editor = document.querySelector('.ck.ck-content.ck-editor__editable') as HTMLElement;
      if (editor) {
        editor.scrollTo?.(0, 0);
      }
      // const blob = await domtoimage.toBlob(document.querySelector('.ck-content') as HTMLElement);
      const blob = await domtoimage.toBlob(
        document.querySelector('.ck.ck-editor__main') as HTMLElement
      );
      formData.append(
        'file',
        new File([blob], 'msg-' + dateutil.yyyymmdd_hhmmss(new Date()) + '.png')
      );
    } else {
      // 선택된 파일을 사용하 것.
      if (!msgFile) {
        toast.error('파일을 선택하여 주십시오', { position: 'bottom-right' });
        return;
      }
      msg.ebrd_msg_html = '';
      msg.ebrd_msg_text = '';
      formData.append('file', msgFile);
    }
    //formData.append('file', );
    formData.append('json', new Blob([JSON.stringify(msg)], { type: 'application/json' }));

    formData.append(
      'meta',
      new Blob([JSON.stringify({ ebrd_seqs: [sel?.ebrd_seq] })], { type: 'application/json' })
    );
    axios
      .post<[IfTbEbrdMsg, [number, number][]]>('/api/ebrd_msg/save_form', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => {
        console.log('res', res);
        //setSel(res.data);
        setSavedMsg(res.data[0]);
        setSavedMaps(res.data[1]);

        toast.success('신규로 전광판 메시지를 등록하였습니다', { position: 'bottom-right' });
        mutate(() => true);
      })
      .catch((e) => {
        console.error('failed:', e);
        toast.error('실패하였습니다.(' + get_err_msg(e) + ')', { position: 'bottom-right' });
      });
  };

  // const handleUpdate = () => {
  //   if (!sel?.ebrd_seq) {
  //     toast.error('전광판을 선택하세요');
  //     return;
  //   }
  //   const msg = { ...ebrdMsg };
  //   axios
  //     .post('/api/ebrd_msg/save', msg)
  //     .then((res) => {
  //       setSel(res.data);
  //       toast.success('수정하였습니다');
  //       mutate(() => true);
  //     })
  //     .catch((e) => {
  //       console.error('E', e);
  //       toast.error('실패하였습니다.(error : ' + e?.message + ')');
  //     });
  // };

  const apiRoomInfo = useSWRMutation('/api/ebrd/ctrl/room_info_by_seq', swrMutator);

  const handleSendRoom = () => {
    console.log('handleSendRoom savedMaps', savedMaps);

    apiRoomInfo
      .trigger({
        ebrd_seq: savedMaps[0][0],
        ebrd_msg_pos: savedMaps[0][1],
      })
      .then((res) => {
        console.log('res', res.data);
        toast.success('전송 하였습니다', { position: 'bottom-right' });
        mutate(() => true);
      })
      .catch((e) => {
        console.error('E', e);
        toast.error('전송 실패하였습니다(' + get_err_msg(e) + ')', { position: 'bottom-right' });
        mutate(() => true);
      });
  };

  const confirm = useConfirm();

  // eslint-disable-next-line
  const handleDelete = () => {
    if (!sel?.ebrd_seq) {
      toast.error('전광판을 선택하세요', { position: 'bottom-right' });
      return;
    }
    confirm('확인', ['삭제하시겠습니까'])
      ?.then(() => {
        console.log('삭제 확인. ');
        axios
          .post('/api/ebrd_msg/delete', sel)
          .then((res) => {
            console.log('res', res.data);
            toast.success('삭제 하였습니다', { position: 'bottom-right' });
            setSel(new TbEbrd());
            mutate(() => true);
          })
          .catch((e) => {
            console.error('E', e);
            toast.error('실패하였습니다(' + get_err_msg(e) + ')', { position: 'bottom-right' });
          });
      })
      .catch((e) => {
        // 취소
        console.log('취소. ', e);
      });
  };

  return (
    <StyledCard sx={{ overflowX: 'auto' }}>
      <SettingTitle>
        <StyledBox>
          <SvgIcon fontSize='large'>
            <SettingsIcon />
          </SvgIcon>
        </StyledBox>
        <Box>
          <Typography variant='h5' fontWeight={700} color='text.primary'>
            전광판 메시지 저장/전송
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            전광판의 메시지를 관리합니다.
          </Typography>
        </Box>
      </SettingTitle>

      <Box sx={{ mt: 3, flexGrow: 1, overflowY: 'auto', minWidth: 900 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Box>선택된 전광판</Box>
          {sel?.ebrd_seq ? (
            <Typography variant='h6' fontWeight={700} color='text.primary'>
              {sel?.ebrd_id + ':' + sel?.ebrd_nm} ({sel?.ebrd_seq})
            </Typography>
          ) : (
            <Typography variant='h6' fontWeight={700} color='text.primary'>
              왼쪽 목록에서 전광판을 선택하세요
            </Typography>
          )}
        </Box>
        {savedMsg?.ebrd_msg_seq && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Box>저장된 방번호</Box>
            <Typography variant='h6' fontWeight={700} color='text.primary'>
              {savedMaps.map((m) => m[1]).join(', ')} ({savedMsg?.ebrd_msg_seq})
            </Typography>
          </Box>
        )}

        {sel?.ebrd_seq && (
          <form>
            <EbrdMsgTbl sel={sel} ebrdMsg={ebrdMsg} setEbrdMsg={setEbrdMsg} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1, mb: 1 }}>
              <FormControl sx={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                <FormLabel>메시지 전송 방식</FormLabel>
                <RadioGroup
                  row
                  value={ebrdMsg?.ebrd_msg_type || ''}
                  onChange={(e) => setEbrdMsg({ ...ebrdMsg, ebrd_msg_type: e.target.value })}
                >
                  <FormControlLabel value='Text' control={<Radio size='small' />} label='텍스트' />
                  <FormControlLabel value='Image' control={<Radio size='small' />} label='이미지' />
                  <FormControlLabel value='Video' control={<Radio size='small' />} label='동영상' />
                </RadioGroup>
              </FormControl>
              {ebrdMsg?.ebrd_msg_type === 'Text' && (
                <EbrdEditor
                  editorwidth='800px'
                  editorheight={
                    String(((800 * (sel?.ebrd_size_h ?? 1)) / (sel?.ebrd_size_w ?? 3)).toFixed(2)) +
                    'px'
                  }
                  data={ebrdMsg?.ebrd_msg_html}
                  onChange={(data) => setEbrdMsg({ ...ebrdMsg, ebrd_msg_html: data })}
                />
              )}
              {(ebrdMsg?.ebrd_msg_type === 'Image' || ebrdMsg?.ebrd_msg_type === 'Video') && (
                <Box
                  sx={{
                    p: 2,
                    border: '1px dashed',
                    borderColor: 'divider',
                    borderRadius: 1,
                    bgcolor: 'background.paper',
                  }}
                >
                  <Typography variant='subtitle1' color='text.secondary' gutterBottom>
                    {ebrdMsg?.ebrd_msg_type === 'Image' ? (
                      <>
                        <Box component='span' sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                          이미지
                        </Box>
                        <Box component='span' sx={{ ml: 1, color: '#898989' }}>
                          해상도가 {(sel?.ebrd_size_w ?? 5) * 16}px * {(sel?.ebrd_size_h ?? 1) * 16}
                          px 입니다. 이미지 크기를 동일하게 편집후 등록하여 주십시오.
                        </Box>
                      </>
                    ) : (
                      <>
                        <Box component='span' sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                          동영상
                        </Box>
                        <Box component='span' sx={{ ml: 1, color: '#898989' }}>
                          용량 20MB이내 avi, wmv파일로 편집 후 등록하여 주십시오.
                        </Box>
                      </>
                    )}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <input
                      type='file'
                      //accept='image/*, video/*'
                      accept={
                        ebrdMsg?.ebrd_msg_type === 'Image'
                          ? 'image/png, image/jpeg, image/jpg, image/gif, image/.bmp'
                          : 'video/mp4, video/avi, video/wmv, video/mov'
                      }
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        //console.log('file', file);
                        if (file) {
                          setMsgFile(file);
                        } else {
                          setMsgFile(null);
                        }
                      }}
                      style={{ display: 'none' }}
                      id='file-upload'
                    />
                    <label htmlFor='file-upload'>
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 2,
                          py: 0.5,
                          bgcolor: 'primary.main',
                          color: '#fff',
                          fontSize: '14px',
                          borderRadius: 1,
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: 'primary.dark',
                          },
                        }}
                      >
                        파일 선택
                      </Box>
                    </label>
                    {msgFile && (
                      <Typography variant='body2' sx={{ mt: 1, color: 'success.main' }}>
                        선택된 파일: {msgFile.name}
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          </form>
        )}
      </Box>

      <StyledCardActions>
        <SettingBtn btnType='add' onClick={handleNewSave} disabled={!sel?.ebrd_seq}>
          신규등록
        </SettingBtn>
        <SettingBtn
          btnType='send'
          onClick={handleSendRoom}
          disabled={!savedMsg?.ebrd_msg_seq || apiRoomInfo.isMutating}
        >
          전송
        </SettingBtn>
        <SettingBtn btnType='reset' onClick={handleReset}>
          초기화
        </SettingBtn>
        {/* <SettingBtn btnType='delete' onClick={handleDelete} disabled={!ebrdMsg?.ebrd_msg_seq}>
          삭제
        </SettingBtn> */}
      </StyledCardActions>
    </StyledCard>
  );
};
