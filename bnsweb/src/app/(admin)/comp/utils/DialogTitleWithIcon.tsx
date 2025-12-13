// @flow
import * as React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { DialogTitle, IconButton } from '@mui/material';

type Props = {
  title: string;
  handleClose: React.MouseEventHandler<HTMLButtonElement> | undefined;
};
export const DialogTitleWithIcon = ({ title, handleClose }: Props) => {
  return (
    <>
      <DialogTitle sx={{ m: 0, p: 2, minHeight: 50 }}>{title}</DialogTitle>
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
    </>
  );
};
