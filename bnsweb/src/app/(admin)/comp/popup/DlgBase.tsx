import Dialog, { DialogProps } from '@mui/material/Dialog';
import { styled } from '@mui/material/styles';

export const DlgBase = styled(Dialog)<
  DialogProps & { minWidth?: number; minHeight?: number; width?: number; height?: number }
>(({ theme, minWidth, minHeight, width, height }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
    minWidth: minWidth ?? 400,
    minHeight: minHeight ?? 170,
    width,
    height,
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));
