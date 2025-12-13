'use client';

import { Box } from '@mui/material';

export const ModalContainer = () => {
  return (
    <Box
      id='modal-container'
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 9999,
        pointerEvents: 'none',
        '& .MuiDialog-root': {
          pointerEvents: 'auto',
        },
      }}
    />
  );
};
