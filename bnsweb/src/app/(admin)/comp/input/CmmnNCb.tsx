// @flow
import { MenuItem, Select, SelectProps } from '@mui/material';

export type CmmnNCbItem = {
  val: number;
  disp: string;
};

type Props = {
  list: CmmnNCbItem[];
  val: number | undefined;
  setVal: (v: number) => void;
};
export const CmmnNCb = ({ list, val, setVal, ...props }: Props & SelectProps) => {
  return (
    <Select
      value={val}
      onChange={(e) => setVal(Number(e.target.value))}
      sx={{ minWidth: '100px' }}
      {...props}
    >
      {(list || []).map((ele) => (
        <MenuItem key={ele.val} value={ele.val}>
          {ele.disp}
        </MenuItem>
      ))}
    </Select>
  );
};
