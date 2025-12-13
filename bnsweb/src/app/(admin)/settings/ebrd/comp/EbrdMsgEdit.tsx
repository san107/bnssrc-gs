'use client';
// @flow
import { SettingBtn } from '@/app/(admin)/settings/alm/SettingBtn';
import { StyledCard, StyledCardActions } from '@/app/(admin)/settings/comp/StyledForm';
import { EbrdEditor } from '@/app/(admin)/settings/ebrd/comp/EbrdEditor';
import { EbrdMsgTbl } from '@/app/(admin)/settings/ebrd/msg/EbrdMsgTbl';
import { refreshImg } from '@/hooks/useImgRefresh';
import { IfTbEbrdMsg, TbEbrdMsg } from '@/models/ebrd/tb_ebrd_msg';
import { IfTbEbrdMsgMap } from '@/models/ebrd/tb_ebrd_msg_map';
import { dateutil } from '@/utils/date-util';
import { get_err_msg } from '@/utils/err-util';
import { swrMutator } from '@/utils/swr-provider';
import {
  Box,
  DialogActions,
  DialogContent,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import axios from 'axios';
import domtoimage from 'dom-to-image';
import { convert } from 'html-to-text';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import useSWR, { useSWRConfig } from 'swr';
import useSWRMutation from 'swr/mutation';

type Props = {
  ebrd_seq?: number | null;
  ebrd_msg_pos?: number | null;
  onClose: () => void;
};

export const EbrdMsgEdit = ({ ebrd_seq, ebrd_msg_pos, onClose }: Props) => {
  const { mutate } = useSWRConfig();
  const [ebrdMsg, setEbrdMsg] = useState<IfTbEbrdMsg | null>(null);
  const [msgFile, setMsgFile] = useState<File | null>(null);
  const [ebrdMapMsg, setEbrdMapMsg] = useState<IfTbEbrdMsgMap | null>(null);
  const { data: ebrd } = useSWR(!!ebrd_seq && ['/api/ebrd/one', { ebrdSeq: ebrd_seq }]);

  const [changed, setChanged] = useState(false);
  const skipChanged = useRef(false);

  useEffect(() => {
    console.log('ebrdMsg', ebrdMsg);
    if (skipChanged.current) {
      skipChanged.current = false;
      return;
    }
    setChanged(true);
  }, [ebrdMsg]);

  useEffect(() => {
    setMsgFile(null);
    const file = document.getElementById('file-upload') as HTMLInputElement;
    if (file) {
      file.value = '';
    }
  }, [ebrdMsg?.ebrd_msg_type]);

  useEffect(() => {
    if (!ebrdMapMsg?.ebrd_msg_seq) {
      setEbrdMsg(null);
      return;
    }
    axios
      .get<IfTbEbrdMsg>('/api/ebrd_msg/one', {
        params: { ebrd_msg_seq: ebrdMapMsg?.ebrd_msg_seq },
      })
      .then((res) => {
        console.log('set ebrdmsg ', res.data);
        skipChanged.current = true;
        setChanged(false);
        setEbrdMsg(res.data);
      })
      .catch((e) => {
        console.error('E', e);
        setEbrdMsg(new TbEbrdMsg());
      });
  }, [ebrdMapMsg?.ebrd_msg_seq]);

  useEffect(() => {
    console.log('ebrd_seq', ebrd_seq);
    console.log('ebrd_msg_pos', ebrd_msg_pos);
    if (!ebrd_seq || !ebrd_msg_pos) {
      setEbrdMapMsg(null);
      return;
    }
    axios
      .get<IfTbEbrdMsgMap>('/api/ebrd_map_msg/one', {
        params: { ebrd_seq: ebrd_seq, ebrd_msg_pos: ebrd_msg_pos },
      })
      .then((res) => {
        console.log('map msg set', res.data);
        setEbrdMapMsg(res.data);
      })
      .catch((e) => {
        console.error('E', e);
        setEbrdMapMsg(null);
      });
  }, [ebrd_seq, ebrd_msg_pos]);

  const handleSave = async () => {
    if (!ebrdMapMsg?.ebrd_seq) {
      toast.error('전광판 메시지 정보가 없습니다', { position: 'bottom-right' });
      return;
    }
    if (!ebrdMsg?.ebrd_msg_seq) {
      toast.error('메시지 정보가 없습니다', { position: 'bottom-right' });
      return;
    }
    // 수정된 정보이므로, 파일일련번호, 메시지, 방번호는 항상 있어야 한다.
    // 수정내용은 변경사항만 할 거시 아니라, 모든 것을 저장한다.
    // 파일이 경우 생성할 수 있을 때만 하고, 이미지, 동영상의 경우는 업데이트 하지 않는다.

    const msg = { ...ebrdMsg };

    if (msg.ebrd_msg_type === 'Text') {
      if (!msg.ebrd_msg_html) {
        toast.error('메시지를 입력하여 주십시오', { position: 'bottom-right' });
        return;
      }
      msg.ebrd_msg_text = convert(ebrdMsg?.ebrd_msg_html);
    }

    msg.update_dt = new Date().toISOString().substring(0, 19);

    const formData = new FormData();

    if (msg.ebrd_msg_type === 'Text') {
      const editor = document.querySelector('.ck.ck-content.ck-editor__editable') as HTMLElement;
      if (editor) {
        editor.scrollTo?.(0, 0);
      }
      //const blob = await domtoimage.toBlob(document.querySelector('.ck-content') as HTMLElement);
      const blob = await domtoimage.toBlob(
        document.querySelector('.ck.ck-editor__main') as HTMLElement
      );
      formData.append(
        'file',
        new File([blob], 'msg-' + dateutil.yyyymmdd_hhmmss(new Date()) + '.png')
      );
    } else {
      // 선택된 파일을 사용하 것.

      msg.ebrd_msg_html = '';
      msg.ebrd_msg_text = '';
      if (msgFile) {
        formData.append('file', msgFile);
      }
    }
    //formData.append('file', );
    formData.append('json', new Blob([JSON.stringify(msg)], { type: 'application/json' }));

    formData.append(
      'meta',
      new Blob([JSON.stringify({ ebrd_seqs: [ebrdMapMsg?.ebrd_seq] })], {
        type: 'application/json',
      })
    );
    axios
      .post<[IfTbEbrdMsg, [number, number][]]>('/api/ebrd_msg/save_form', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => {
        console.log('res', res);
        //setSel(res.data);
        toast.success('전광판 메시지를 저장하였습니다', { position: 'bottom-right' });
        refreshImg(ebrdMsg.file_seq);
        setChanged(false);
        mutate(() => true);
      })
      .catch((e) => {
        console.error('failed:', e);
        toast.error('실패하였습니다.(' + get_err_msg(e) + ')', { position: 'bottom-right' });
      });
  };

  const apiRoomInfo = useSWRMutation('/api/ebrd/ctrl/room_info_by_seq', swrMutator);

  const handleSendRoom = () => {
    console.log('handleSendRoom savedMaps', ebrdMapMsg);

    apiRoomInfo
      .trigger({
        ebrd_seq: ebrdMapMsg?.ebrd_seq,
        ebrd_msg_pos: ebrdMapMsg?.ebrd_msg_pos,
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

  //console.log('ebrdMsg', ebrdMsg);
  return (
    <>
      <DialogContent
        dividers
        sx={{
          '&.MuiDialogContent-root': { padding: 0 },
          '& .MuiListItemButton-root': {
            borderBottom: '1px solid #ddf',
            '&:last-child': { borderBottom: 0 },
          },
        }}
      >
        <StyledCard sx={{ overflowX: 'auto' }}>
          <Box sx={{ mt: 3, flexGrow: 1, overflowY: 'auto', minWidth: 900 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Box>선택된 전광판</Box>
              {ebrd?.ebrd_seq ? (
                <Typography variant='h6' fontWeight={700} color='text.primary'>
                  {ebrd?.ebrd_id + ':' + ebrd?.ebrd_nm} ({ebrd?.ebrd_seq})
                </Typography>
              ) : (
                <Typography variant='h6' fontWeight={700} color='text.primary'>
                  전광판을 선택하세요
                </Typography>
              )}
            </Box>
            {ebrdMapMsg?.ebrd_msg_seq && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Box>저장된 방번호</Box>
                <Typography variant='h6' fontWeight={700} color='text.primary'>
                  {ebrdMapMsg?.ebrd_msg_pos} ({ebrdMapMsg?.ebrd_msg_seq})
                </Typography>
              </Box>
            )}

            <form>
              <EbrdMsgTbl
                edit
                sel={ebrd}
                ebrdMsg={ebrdMsg}
                setEbrdMsg={(v) => {
                  console.log('v', v);
                  setEbrdMsg(v);
                }}
                msgPos={ebrdMapMsg?.ebrd_msg_pos}
                topBorder={true}
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1, mb: 1 }}>
                <FormControl sx={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                  <FormLabel>메시지 전송 방식</FormLabel>
                  <RadioGroup
                    row
                    value={ebrdMsg?.ebrd_msg_type || ''}
                    onChange={(e) => setEbrdMsg({ ...ebrdMsg, ebrd_msg_type: e.target.value })}
                  >
                    <FormControlLabel
                      value='Text'
                      control={<Radio size='small' />}
                      label='텍스트'
                    />
                    <FormControlLabel
                      value='Image'
                      control={<Radio size='small' />}
                      label='이미지'
                    />
                    <FormControlLabel
                      value='Video'
                      control={<Radio size='small' />}
                      label='동영상'
                    />
                  </RadioGroup>
                </FormControl>
                {ebrdMsg?.ebrd_msg_type === 'Text' && (
                  <EbrdEditor
                    editorwidth='800px'
                    editorheight={
                      String(
                        ((800 * (ebrdMsg?.ebrd_size_h ?? 1)) / (ebrdMsg?.ebrd_size_w ?? 3)).toFixed(
                          2
                        )
                      ) + 'px'
                    }
                    data={ebrdMsg?.ebrd_msg_html}
                    onChange={(data) => setEbrdMsg({ ...ebrdMsg, ebrd_msg_html: data })}
                  />
                )}
                {(ebrdMsg?.ebrd_msg_type === 'Image' || ebrdMsg?.ebrd_msg_type === 'Video') && (
                  <Box>
                    <input
                      type='file'
                      //accept='image/*, video/*'
                      accept={ebrdMsg?.ebrd_msg_type === 'Image' ? 'image/*' : 'video/*'}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        //console.log('file', file);
                        if (file) {
                          setMsgFile(file);
                        } else {
                          setMsgFile(null);
                        }
                      }}
                    />
                  </Box>
                )}
              </Box>
            </form>
          </Box>
        </StyledCard>
      </DialogContent>
      <DialogActions sx={{ margin: 'auto' }}>
        <StyledCardActions style={{ justifyContent: 'end' }}>
          <SettingBtn
            btnType='save'
            onClick={handleSave}
            disabled={!ebrdMapMsg?.ebrd_seq || !changed}
          >
            저장
          </SettingBtn>
          <SettingBtn
            btnType='send'
            onClick={handleSendRoom}
            disabled={!ebrdMsg?.ebrd_msg_seq || apiRoomInfo.isMutating || changed}
          >
            전송
          </SettingBtn>
          {/* <SettingBtn btnType='reset' onClick={handleReset}>
            초기화
          </SettingBtn> */}
          <SettingBtn btnType='cancel' onClick={onClose}>
            닫기
          </SettingBtn>
          {/* <SettingBtn btnType='delete' onClick={handleDelete} disabled={!ebrdMsg?.ebrd_msg_seq}>
          삭제
        </SettingBtn> */}
        </StyledCardActions>
      </DialogActions>
    </>
  );
};
