// @flow
import { MenuItem, Select, SelectProps } from '@mui/material';

export type CmmnCbItem = {
  val: string;
  disp: string;
};

type Props = {
  list: CmmnCbItem[];
  val: string | undefined;
  setVal: (v: string) => void;
};
export const CmmnCb = ({ list, val, setVal, ...props }: Props & SelectProps) => {
  return (
    <Select
      value={val}
      onChange={(e) => setVal(String(e.target.value))}
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
