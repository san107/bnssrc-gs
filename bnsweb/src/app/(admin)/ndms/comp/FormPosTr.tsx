// @flow
import { FormTd, FormTh, FormTr } from '@/app/(admin)/comp/table/FormTbl';
import { TextField } from '@mui/material';
import * as React from 'react';
type Props = {
  value?: string | number;
  onClick?: (e) => void;
  placeholder?: string;
  label?: string;
};
export const FormPosTr = ({ value, onClick, placeholder, label }: Props) => {
  return (
    <FormTr>
      <FormTh>{label}</FormTh>
      <FormTd sx={{ pr: 3 }}>
        <TextField
          fullWidth
          size='small'
          value={value || ''}
          onClick={onClick}
          placeholder={placeholder}
        />
      </FormTd>
    </FormTr>
  );
};
