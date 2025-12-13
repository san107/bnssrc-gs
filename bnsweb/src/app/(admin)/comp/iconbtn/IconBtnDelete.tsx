// @flow
import { IconButton } from '@mui/material';
import * as React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';

type Props = {
  onClick: () => void;
};
export const IconBtnDelete = ({ onClick }: Props) => {
  return (
    <IconButton
      size='small'
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
    >
      <DeleteIcon fontSize='inherit' />
    </IconButton>
  );
};
