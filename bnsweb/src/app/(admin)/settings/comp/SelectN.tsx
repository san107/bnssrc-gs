// @flow
import { MenuItem, Select, SelectProps } from '@mui/material';
import * as React from 'react';
type Props = {
  start: number; // 시작 번호
  end: number; // 종료 번호
  val: number; // 선택 번호
  setVal: (v: number) => void;
};
export const SelectN = ({ start, end, val, setVal, ...props }: Props & SelectProps) => {
  return (
    <Select
      value={val}
      onChange={(e) => setVal(Number(e.target.value))}
      {...props}
      sx={{ minWidth: '100px' }}
    >
      {Array.from({ length: end - start + 1 }, (_, i) => i + start).map((ele) => (
        <MenuItem key={ele} value={ele}>
          {ele}
        </MenuItem>
      ))}
    </Select>
  );
};
