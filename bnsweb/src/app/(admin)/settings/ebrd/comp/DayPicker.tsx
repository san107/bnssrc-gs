'use client';
// @flow
import DatePicker from 'react-datepicker';
import { ko } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
import * as React from 'react';
import { Box, BoxProps, styled } from '@mui/material';
import { ymd as ymdUtil } from '@/utils/time-util';
type Props = {
  ymd?: string;
  setYmd: (ymd?: string) => void;
  fmt?: string;
  disabled?: boolean;
};
export const DayPicker = ({ ymd, setYmd, fmt, disabled, ...props }: Props & BoxProps) => {
  return (
    <StyledDatePicker {...props}>
      <DatePicker
        selected={ymdUtil.getdate(ymd)}
        disabled={disabled}
        onChange={(date) => setYmd(ymdUtil.getymdhm(date || undefined))}
        dateFormat={fmt || 'yyyy-MM-dd'}
        locale={ko}
        className='date-picker'
        showYearDropdown
        scrollableYearDropdown
        yearDropdownItemNumber={20}
        showMonthDropdown
        todayButton='오늘'
      />
    </StyledDatePicker>
  );
};

const StyledDatePicker = styled(Box)({
  border: '1px solid #ccc',
  '& .date-picker': {
    '&:disabled': {
      color: '#999',
      cursor: 'default',
    },
    width: '95px',
    cursor: 'pointer',
    padding: '5px',
  },
  '& .react-datepicker__header__dropdown': {
    fontSize: '15px',
  },
});
