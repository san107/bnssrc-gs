'use client';

import { useConfirm } from '@/app/(admin)/comp/popup/DlgConfirm';
import { FormTd, FormTh, FormTr } from '@/app/(admin)/comp/table/FormTbl';
import { SettingBtn } from '@/app/(admin)/settings/alm/SettingBtn';
import { SettingTitle } from '@/app/(admin)/settings/comp/SettingTitle';
import {
  StyledCard,
  StyledBox,
  StyledFormTbl,
  StyledCardActions,
} from '@/app/(admin)/settings/comp/StyledForm';
import { Box, SvgIcon, TextField, Typography } from '@mui/material';
import axios from 'axios';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import { toast } from 'sonner';
import { useSWRConfig } from 'swr';
import { IfTbBoard } from '@/models/tb_board';
import { useEffect, useState } from 'react';
import { useLoginInfo } from '@/app/(admin)/leftmenu/useLoginInfo';
import { IfTbFile } from '@/models/tb_file';
import { BoardEditor } from '@/app/(admin)/settings/admin/comp/BoardEditor';

type Props = {
  sel: IfTbBoard;
  setSel: (v: IfTbBoard) => void;
};

export const FormNotice = ({ sel, setSel }: Props) => {
  const { mutate } = useSWRConfig();
  const { login } = useLoginInfo();
  const [noticeFile, setNoticeFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<IfTbFile | null>(null);

  // 글작성자가 inst 인 경우 inst 만 수정,삭제 가능하게 처리하도록 구분.
  const isAuthor = sel?.user_id === login.user_id || login.user_id === 'inst';

  const handleReset = () => {
    setSel({
      bd_title: '',
      bd_contents: '',
    });
    setNoticeFile(null);
  };

  useEffect(() => {
    if (sel?.file_seq && typeof sel.file_seq === 'number' && sel.file_seq > 0) {
      axios
        .get<IfTbFile>('/api/file/one', {
          params: { fileSeq: sel.file_seq },
        })
        .then((res) => {
          if (res.data && res.data.file_nm) {
            setFileInfo(res.data);
          } else {
            setFileInfo(null);
          }
        })
        .catch((e) => {
          console.error('E', e);
          setFileInfo(null);
        });
    } else {
      setFileInfo(null);
    }
  }, [sel?.file_seq]);

  // 선택된 파일 초기화
  useEffect(() => {
    setNoticeFile(null);
  }, [sel?.bd_seq]);

  const handleNewSave = () => {
    if (!sel.bd_title?.trim()) {
      toast.error('제목을 입력해주세요.');
      return;
    }

    const formData = new FormData();
    const copySel = { ...sel };
    copySel.bd_seq = -1; // 신규 등록시 -1로 설정
    copySel.bd_type = 'NOTICE';
    copySel.user_id = login.user_id;
    const now = new Date().toISOString().substring(0, 19);
    copySel.bd_create_dt = now;
    copySel.bd_update_dt = now;

    if (noticeFile) {
      formData.append('file', noticeFile);
    }
    formData.append('json', new Blob([JSON.stringify(copySel)], { type: 'application/json' }));

    axios
      .post('/api/board/save_form', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((res) => {
        setSel(res.data);
        toast.success('신규로 공지사항을 등록하였습니다');
        mutate(() => true);
      })
      .catch((e) => {
        console.error('E', e);
        toast.error('실패하였습니다.(error : ' + e?.message + ')');
      });
  };

  const handleUpdate = () => {
    if (!sel.bd_title?.trim()) {
      toast.error('제목을 입력해주세요.');
      return;
    }

    const formData = new FormData();
    const copySel = { ...sel };
    copySel.bd_update_dt = new Date().toISOString().substring(0, 19);

    if (noticeFile) {
      formData.append('file', noticeFile);
    }
    formData.append('json', new Blob([JSON.stringify(copySel)], { type: 'application/json' }));

    axios
      .post('/api/board/save_form', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((res) => {
        setSel(res.data);
        toast.success('수정하였습니다');
        mutate(() => true);
      })
      .catch((e) => {
        toast.error('실패하였습니다.(error : ' + e?.message + ')');
      });
  };

  const confirm = useConfirm();
  const handleDelete = () => {
    confirm('확인', ['삭제하시겠습니까'])
      ?.then(() => {
        console.log('삭제 확인. ');
        axios
          .post('/api/board/delete', sel)
          .then((res) => {
            console.log('res', res.data);
            toast.success('삭제 하였습니다');
            setSel({
              bd_type: 'N',
              bd_title: '',
              bd_contents: '',
            });
            setNoticeFile(null);
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

  const handleDownload = () => {
    if (!sel?.file_seq || typeof sel.file_seq !== 'number' || sel.file_seq <= 0) return;
    window.open(`/api/file/download_nocache?fileSeq=${sel.file_seq}`, '_blank');
  };

  return (
    <StyledCard>
      <SettingTitle>
        <StyledBox>
          <SvgIcon fontSize='large'>
            <NoteAltIcon />
          </SvgIcon>
        </StyledBox>
        <Box>
          <Typography variant='h5' fontWeight={700} color='text.primary'>
            공지사항 관리
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            공지사항을 등록하고 편집 관리합니다.
          </Typography>
        </Box>
      </SettingTitle>

      <Box sx={{ mt: 3, flexGrow: 1, overflowY: 'auto' }}>
        <form>
          <StyledFormTbl width={'100%'}>
            <colgroup>
              <col width={'20%'} />
              <col width={'80%'} />
            </colgroup>
            <tbody>
              <FormTr>
                <FormTh>제목</FormTh>
                <FormTd sx={{ pr: 3 }}>
                  <TextField
                    fullWidth
                    size='small'
                    value={sel?.bd_title || ''}
                    onChange={(e) => setSel({ ...sel, bd_title: e.target.value })}
                  />
                </FormTd>
              </FormTr>
              <FormTr>
                <FormTh>내용</FormTh>
                <FormTd sx={{ pr: 3 }}>
                  {sel && (
                    <BoardEditor
                      key={sel.bd_seq || 'new'}
                      data={sel.bd_contents || ''}
                      onChange={(data) => {
                        setSel({ ...sel, bd_contents: data });
                      }}
                    />
                  )}
                </FormTd>
              </FormTr>
              <FormTr>
                <FormTh>첨부파일</FormTh>
                <FormTd sx={{ pr: 3 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <input
                      type='file'
                      accept='*/*'
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setNoticeFile(file);
                        } else {
                          setNoticeFile(null);
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
                    {noticeFile && (
                      <Typography variant='body2' sx={{ mt: 1, color: 'success.main' }}>
                        선택된 파일: {noticeFile.name}
                      </Typography>
                    )}
                    {sel?.file_seq && !noticeFile && fileInfo && (
                      <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant='body2'>
                          기존 첨부파일:{' '}
                          <span
                            onClick={handleDownload}
                            style={{ cursor: 'pointer', color: 'blue' }}
                          >
                            {fileInfo.file_nm}
                          </span>
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </FormTd>
              </FormTr>
            </tbody>
          </StyledFormTbl>
        </form>
      </Box>

      <StyledCardActions>
        <SettingBtn btnType='add' onClick={handleNewSave}>
          신규등록
        </SettingBtn>
        <SettingBtn btnType='save' onClick={handleUpdate} disabled={!sel?.bd_seq || !isAuthor}>
          수정
        </SettingBtn>
        <SettingBtn btnType='reset' onClick={handleReset}>
          초기화
        </SettingBtn>
        <SettingBtn btnType='delete' onClick={handleDelete} disabled={!sel?.bd_seq || !isAuthor}>
          삭제
        </SettingBtn>
      </StyledCardActions>
    </StyledCard>
  );
};
