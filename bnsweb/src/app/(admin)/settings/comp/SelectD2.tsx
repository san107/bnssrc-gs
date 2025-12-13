// @flow
import { MenuItem, Select, SelectProps } from '@mui/material';
import * as React from 'react';
type Props = {
  start: number; // 시작 번호
  end: number; // 종료 번호
  val: string; // 선택 번호
  setVal: (v: string) => void;
};
export const SelectD2 = ({ start, end, val, setVal, sx, ...props }: Props & SelectProps) => {
  return (
    <Select
      value={val}
      onChange={(e) => setVal(String(e.target.value))}
      {...props}
      sx={{ minWidth: '100px', ...sx }}
    >
      {Array.from({ length: end - start + 1 }, (_, i) =>
        (i + start).toString().padStart(2, '0')
      ).map((ele) => (
        <MenuItem key={ele} value={ele}>
          {ele}
        </MenuItem>
      ))}
    </Select>
  );
};
