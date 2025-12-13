import { IfTbBoard } from '@/models/tb_board';
import React, { useEffect, useState } from 'react';
import { renderHtml } from '@/utils/html-utils';
import { IfTbFile } from '@/models/tb_file';
import axios from 'axios';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useMobile } from '@/hooks/useMobile';
import { styled } from '@mui/material/styles';
import { Box, Typography, Button } from '@mui/material';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  notice: IfTbBoard | null;
}

const DialogOverlay = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
  backdropFilter: 'blur(4px)',
  animation: 'fadeIn 0.3s ease-out',
});

const DialogContent = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isMobile',
})<{ isMobile: boolean }>(({ isMobile }) => ({
  background: 'white',
  padding: isMobile ? '1rem' : '3rem',
  borderRadius: isMobile ? 0 : '20px',
  maxWidth: isMobile ? '100%' : '800px',
  width: isMobile ? '100%' : '90%',
  maxHeight: '85vh',
  overflowY: 'auto',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
  animation: 'slideUp 0.4s ease-out',
  position: 'relative',
  '&::-webkit-scrollbar': {
    width: '10px',
  },
  '&::-webkit-scrollbar-track': {
    background: '#f1f1f1',
    borderRadius: '5px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#ddd',
    borderRadius: '5px',
    border: '2px solid #f1f1f1',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    background: '#ccc',
  },
}));

const Title = styled(Typography)({
  margin: '0 0 2rem 0',
  color: '#3b5eb4',
  fontSize: '1.5rem',
  fontWeight: 700,
  lineHeight: 1.4,
  letterSpacing: '-0.02em',
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
});

const TitleIcon = styled(AssignmentIcon)({
  color: '#165ac2',
  fontSize: '1.75rem',
});

const DialogInfo = styled(Box)({
  marginBottom: '2rem',
  color: '#666',
  display: 'flex',
  gap: '2rem',
  fontSize: '1rem',
  background: '#f8f9fa',
  padding: '0.75rem 1.25rem',
  borderRadius: 0,
  border: '1px solid #e0e0e0',
});

const InfoParagraph = styled(Typography)({
  margin: 0,
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
});

const InfoStrong = styled('strong')({
  color: '#333',
  fontWeight: 600,
});

const DialogBody = styled(Box)({
  marginBottom: '2rem',
  lineHeight: 1.8,
  color: '#2c2c2c',
  fontSize: '1.1rem',
});

const DialogFiles = styled(Box)({
  marginTop: '2rem',
  padding: '1rem 1.25rem',
  borderTop: 'none',
  background: 'transparent',
  borderRadius: 0,
  border: '1px solid #e0e0e0',
});

const FilesStrong = styled('strong')({
  display: 'block',
  marginBottom: '1rem',
  color: '#333',
  fontWeight: 600,
  fontSize: '1.1rem',
});

const FilesParagraph = styled(Typography)({
  margin: 0,
});

const FileLink = styled('span')({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.75rem 1.25rem',
  background: 'white',
  borderRadius: '10px',
  transition: 'all 0.2s ease',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  cursor: 'pointer',
  color: '#0947f3',
  textDecoration: 'underline',
  '&:hover': {
    background: '#f0f0f0',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
});

const CloseButton = styled(Button)({
  marginTop: '2.5rem',
  padding: '0.5rem 2rem',
  background: '#165ac2',
  border: 'none',
  borderRadius: '4px',
  color: '#fff',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '1.1rem',
  transition: 'all 0.3s ease',
  display: 'block',
  marginLeft: 'auto',
  '&:hover': {
    background: '#287af5',
  },
});

export const DlgNotice = ({ isOpen, onClose, notice }: Props) => {
  const [fileInfo, setFileInfo] = useState<IfTbFile | null>(null);
  const { isMobile } = useMobile();

  useEffect(() => {
    if (notice?.file_seq && typeof notice.file_seq === 'number' && notice.file_seq > 0) {
      axios
        .get<IfTbFile>('/api/file/one', {
          params: { fileSeq: notice.file_seq },
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
  }, [notice?.file_seq]);

  const handleDownload = () => {
    if (!notice?.file_seq || typeof notice.file_seq !== 'number' || notice.file_seq <= 0) return;
    window.open(`/api/file/download_nocache?fileSeq=${notice.file_seq}`, '_blank');
  };

  if (!isOpen || !notice) return null;

  return (
    <DialogOverlay onClick={onClose}>
      <DialogContent isMobile={isMobile} onClick={(e) => e.stopPropagation()}>
        <Title>
          <TitleIcon />
          {notice.bd_title}
        </Title>
        <DialogInfo>
          <InfoParagraph>
            <InfoStrong>작성자:</InfoStrong> {notice.user_id}
          </InfoParagraph>
          <InfoParagraph>
            <InfoStrong>작성일:</InfoStrong>{' '}
            {notice.bd_create_dt ? new Date(notice.bd_create_dt).toISOString().split('T')[0] : ''}
          </InfoParagraph>
        </DialogInfo>
        <DialogBody>{renderHtml(notice.bd_contents)}</DialogBody>
        {notice.file_seq && fileInfo && (
          <DialogFiles>
            <FilesStrong>첨부파일:</FilesStrong>
            <FilesParagraph>
              <FileLink onClick={handleDownload}>{fileInfo.file_nm}</FileLink>
            </FilesParagraph>
          </DialogFiles>
        )}
        <CloseButton onClick={onClose}>닫기</CloseButton>
      </DialogContent>
    </DialogOverlay>
  );
};
