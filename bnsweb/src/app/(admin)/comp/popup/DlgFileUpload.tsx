import { BootstrapDialog } from '@/app/(admin)/comp/popup/BootstrapDialog';
import { usePromise } from '@/hooks/usePromise';
import { useRefComponent } from '@/hooks/useRefComponent';
import { IfTbFile } from '@/models/tb_file';
import CloseIcon from '@mui/icons-material/Close';
import { Box } from '@mui/material';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import * as React from 'react';
import { useState } from 'react';
import { toast } from 'sonner';

type Props = {
  show: (props: { fileSeq?: number }) => Promise<{ cmd: string; fileSeq?: number }>;
};

export const DlgFileUpload = React.forwardRef<Props, unknown>((props, ref) => {
  const [open, setOpen] = useState(false);
  const promise = usePromise<any, any>();
  const [fileSeq, setFileSeq] = useState<number | undefined>(undefined);
  const [file, setFile] = useState<File | null>(null);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    promise.current.reject?.({ cmd: 'close' });
  };

  React.useImperativeHandle<Props, Props>(
    ref,
    (): Props => ({
      show: ({ fileSeq }) => {
        return new Promise((resolve, reject) => {
          promise.current.resolve = resolve;
          promise.current.reject = reject;
          setFileSeq(fileSeq);
          setFile(null);
          handleClickOpen();
        });
      },
    })
  );

  const handleUpload = () => {
    if (!file) {
      toast.error('파일을 선택해주세요.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append(
      'json',
      new Blob([JSON.stringify({ file_seq: fileSeq })], { type: 'application/json' })
    );
    axios
      .post<IfTbFile>('/api/file/save', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => {
        console.log('res', res);
        setOpen(false);
        promise.current.resolve?.({ cmd: 'ok', fileSeq: res.data.file_seq });
      })
      .catch((e) => {
        console.error('File upload failed:', e);
        toast.error('파일 업로드에 실패했습니다.');
        setOpen(false);
        promise.current.reject?.({ cmd: 'error', e });
      });
  };
  return (
    <React.Fragment>
      {/* <BootstrapDialog onClose={handleClose} open={open} $minWidth={400} $minHeight={170}> */}
      <BootstrapDialog onClose={handleClose} open={open}>
        <DialogTitle sx={{ m: 0, p: 2, minHeight: 50 }}>파일 업로드</DialogTitle>
        <IconButton
          aria-label='close'
          onClick={handleClose}
          sx={(theme) => ({
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          })}
        >
          <CloseIcon />
        </IconButton>
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
          <Box sx={{ p: 2 }}>
            <FileInput
              type='file'
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setFile(file);
                }
              }}
            />
          </Box>
          {file && file.type.startsWith('image/') && (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <img
                src={URL.createObjectURL(file)}
                alt='Preview'
                style={{
                  maxWidth: '100%',
                  maxHeight: '300px',
                  objectFit: 'contain',
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ margin: 'auto' }}>
          <Button onClick={handleClose} sx={{ minWidth: 100 }} color='secondary'>
            취소
          </Button>
          <Button autoFocus onClick={handleUpload} color='primary' sx={{ minWidth: 100 }}>
            업로드
          </Button>
        </DialogActions>
      </BootstrapDialog>
    </React.Fragment>
  );
});

const FileInput = styled('input')({
  display: 'inline-block',
  width: '100%',
  padding: '8px',
  border: '1px solid #ddd',
  borderRadius: '4px',
  cursor: 'pointer',
  '&:hover': {
    borderColor: '#999',
  },
  '&:focus': {
    outline: 'none',
    borderColor: '#1976d2',
    boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)',
  },
});

DlgFileUpload.displayName = 'DlgFileUpload';
export const useDlgFileUpload = () => useRefComponent<Props>(DlgFileUpload);
