// @flow
import { Dialog, styled } from '@mui/material';

export const BootstrapDialog = styled(Dialog)<{
  $minWidth?: string | number;
  $minHeight?: string | number;
}>(({ theme, $minWidth, $minHeight }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
    minWidth: $minWidth || 400,
    minHeight: $minHeight || 170,
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
  '& .MuiPaper-root.MuiDialog-paper': {
    maxWidth: 'calc(100% - 64px)',
  },
}));
