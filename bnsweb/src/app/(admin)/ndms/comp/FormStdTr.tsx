import { FormTd, FormTh, FormTr } from '@/app/(admin)/comp/table/FormTbl';
import { TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

type Props = {
  label: string;
  value?: string | number;
  onChange: (value: string) => void;
  onPaste?: (e: React.ClipboardEvent<HTMLDivElement>) => void;
  readonly?: boolean;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  error?: string;
};

export const FormStdTr = ({
  label,
  value,
  onChange,
  onPaste,
  readonly,
  placeholder,
  required,
  maxLength,
  error,
}: Props) => {
  const [val, setVal] = useState<string>(
    typeof value === 'number' ? '' + value : value === undefined ? '' : value
  );
  //console.log('val', val, value);
  useEffect(() => {
    if (typeof value === 'number' && isNaN(value)) {
      setVal('');
      return;
    }
    // if (float) {
    //   const a = parseFloat(val);
    //   const b = typeof value === 'number' || value === undefined ? value : parseFloat(value);
    //   if (a !== b) {
    //     setVal(typeof value === 'number' ? '' + value : value === undefined ? '' : value);
    //   }
    // } else {

    // }

    const v = typeof value === 'number' ? '' + value : value === undefined ? '' : value;
    setVal(v);
  }, [value]);
  useEffect(() => {
    setTimeout(() => {
      onChange(val);
    }, 1);
    // eslint-disable-next-line
  }, [val]);
  return (
    <FormTr>
      <FormTh>
        {label}
        {required && <span style={{ color: 'red', marginLeft: '2px' }}> *</span>}
      </FormTh>
      <FormTd>
        <TextField
          fullWidth
          value={val || ''}
          onChange={(e) => {
            //console.log('v======al', e.target.value, (e.nativeEvent as any).isComposing);
            const newVal = maxLength ? e.target.value.slice(0, maxLength) : e.target.value;
            setVal(newVal);
          }}
          onPaste={onPaste}
          disabled={readonly}
          placeholder={placeholder}
          required={required}
          error={!!error}
          inputProps={{ maxLength }}
        />
        {error && (
          <Typography variant='caption' sx={{ color: 'error.main', mt: 0.5, display: 'block' }}>
            {error}
          </Typography>
        )}
      </FormTd>
    </FormTr>
  );
};
