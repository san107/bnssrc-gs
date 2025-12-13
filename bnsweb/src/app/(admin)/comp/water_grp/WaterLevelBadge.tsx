'use client';

import styled from '@emotion/styled';
import { Box } from '@mui/material';

export const WaterLevelBadge = styled(Box)(() => ({
  maxWidth: '60px',
  height: '28px',
  padding: '0 6px',
  borderRadius: '14px',
  color: 'white',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontWeight: 600,
  fontSize: '0.875rem',
  minWidth: '60px',
}));
