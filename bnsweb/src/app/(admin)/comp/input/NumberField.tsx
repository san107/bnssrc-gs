import { styled, TextField, TextFieldProps } from '@mui/material';
import { useEffect, useState } from 'react';

export const NumberField = styled(TextField)`
  & input::-webkit-outer-spin-button,
  & input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

type Props = TextFieldProps & {
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  onPaste?: (e: React.ClipboardEvent<HTMLInputElement>) => void;
};

export const NumberField2 = ({ onChange, value: propValue, onPaste, ...props }: Props) => {
  const [value, setValue] = useState<string>(propValue === undefined ? '' : '' + propValue);
  useEffect(() => {
    if (value === '' && propValue === undefined) return;
    if (parseFloat(value) === propValue) return;
    const v = '' + (propValue ?? '');
    if (v === value) return;
    setValue(v);
    // eslint-disable-next-line
  }, [propValue]);

  useEffect(() => {
    if (value === '' && propValue === undefined) return;
    const v = parseFloat(value);
    if (isNaN(v)) {
      if (propValue === undefined) return;
      setTimeout(() => onChange(undefined), 1); // 무한루프를 방지하기 위해 setTimeout 사용
      return;
    }
    if (v === propValue) return;
    setTimeout(() => onChange(v), 1); // 무한루프를 방지하기 위해 setTimeout 사용
    // eslint-disable-next-line
  }, [value]);

  return (
    <NumberField
      {...props}
      value={value}
      type='number'
      onPaste={onPaste}
      onChange={(e) => setValue(e.target.value)}
    />
  );
};
