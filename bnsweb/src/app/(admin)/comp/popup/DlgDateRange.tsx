import { DlgBase } from '@/app/(admin)/comp/popup/DlgBase';
import { DlgTitle } from '@/app/(admin)/comp/popup/DlgTitle';
import { SettingBtn } from '@/app/(admin)/settings/alm/SettingBtn';
import { usePromise } from '@/hooks/usePromise';
import { useRefComponent } from '@/hooks/useRefComponent';
import { DialogContent } from '@mui/material';
import DialogActions from '@mui/material/DialogActions';
import 'ol/ol.css';
import * as React from 'react';
import { useState } from 'react';
import DatePicker from 'react-datepicker';
import { ko } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
import { useMobile } from '@/hooks/useMobile';

export type IfDateRange = {
  start: Date | null;
  end: Date | null;
};

type Props = {
  show: (def?: IfDateRange) => Promise<IfDateRange>;
};

export const DlgDateRange = React.forwardRef<Props, unknown>((props, ref) => {
  const [open, setOpen] = React.useState(false);
  const promise = usePromise<IfDateRange, { cmd: string; msg?: string }>();
  const { isMobile } = useMobile();

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    promise.current.reject?.({ cmd: 'close' });
  };

  const handleOk = () => {
    setOpen(false);
    promise.current.resolve?.({ start: startDate, end: endDate });
  };

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const onChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  React.useImperativeHandle<Props, Props>(
    ref,
    (): Props => ({
      show: (def?: IfDateRange) => {
        return new Promise((resolve, reject) => {
          promise.current.resolve = resolve;
          promise.current.reject = reject;
          setStartDate(def?.start ?? null);
          setEndDate(def?.end ?? null);
          handleClickOpen();
        });
      },
    })
  );

  return (
    <React.Fragment>
      <DlgBase
        onClose={handleClose}
        open={open}
        maxWidth={false}
        // minHeight={isMobile ? window.innerHeight : 310}
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            margin: isMobile ? 0 : 2,
          },
        }}
      >
        <DlgTitle title={'날짜 범위 선택'} handleClose={handleClose} />
        <DialogContent
          dividers
          sx={{
            padding: isMobile ? 1 : 2,
            '& .react-datepicker': {
              width: '100%',
              border: 'none',
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'center',
              position: 'relative',
            },
            '& .react-datepicker__month-container': {
              width: isMobile ? '100%' : '50%',
              float: 'none',
              '&:first-of-type': {
                marginRight: isMobile ? 0 : '1rem',
              },
            },
            '& .react-datepicker__header': {
              backgroundColor: 'transparent',
              borderBottom: 'none',
              padding: '0',
              position: 'relative',
            },
            '& .react-datepicker__current-month': {
              backgroundColor: '#f5f5f5',
              padding: '0.7rem 0',
              fontSize: '1rem',
              fontWeight: 600,
              color: '#4d4c4c',
              position: 'relative',
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            },
            '& .react-datepicker__navigation': {
              position: 'absolute',
              top: '0.7rem',
              transform: 'none',
              padding: 0,
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backgroundColor: 'transparent',
              zIndex: 1,
              border: 'none',
              '&:hover': {
                backgroundColor: 'transparent',
              },
              '&--previous': {
                left: '0.5rem',
              },
              '&--next': {
                right: '0.5rem',
              },
            },
            '& .react-datepicker__navigation-icon': {
              position: 'relative',
              display: 'block',
              width: '0',
              height: '0',
              '&::before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) rotate(45deg)',
                borderStyle: 'solid',
                borderWidth: '2px 2px 0 0',
                width: '10px',
                height: '10px',
                borderColor: '#4d4c4c',
              },
            },
            '& .react-datepicker__navigation-icon--next::before': {
              transform: 'translate(-75%, -50%) rotate(45deg)',
            },
            '& .react-datepicker__navigation-icon--previous::before': {
              transform: 'translate(-25%, -50%) rotate(-135deg)',
            },
            '& .react-datepicker__day-names': {
              display: 'flex',
              justifyContent: 'space-around',
              margin: '0',
              backgroundColor: '#f5f5f5',
              padding: '0.5rem 0',
            },
            '& .react-datepicker__day-name': {
              width: isMobile ? '14%' : '2rem',
              margin: 0,
              color: '#4d4c4c',
              fontWeight: 500,
              '&:first-of-type': {
                color: '#f44336', // 일요일 빨간색
              },
              '&:last-of-type': {
                color: '#0077d8', // 토요일 파란색
              },
            },
            '& .react-datepicker__month': {
              margin: isMobile ? '0' : '0.5rem 0',
            },
            '& .react-datepicker__week': {
              display: 'flex',
              justifyContent: 'space-around',
            },
            '& .react-datepicker__day': {
              width: isMobile ? '14%' : '2rem',
              lineHeight: isMobile ? '2.5rem' : '2rem',
              height: isMobile ? '2.5rem' : '2rem',
              margin: 0,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              '&:hover': {
                backgroundColor: '#d8efff',
                borderRadius: '50%',
              },
              '&--selected': {
                backgroundColor: '#5fb0f3',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#1976d2',
                },
              },
              '&--in-range': {
                backgroundColor: '#bde3fd',
                '&:hover': {
                  backgroundColor: '#bbdefb',
                },
              },
              '&--keyboard-selected': {
                backgroundColor: '#5fb0f3',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#1976d2',
                },
              },
              '&:nth-of-type(7n)': {
                // 토요일
                color: '#0077d8',
              },
              '&:nth-of-type(7n + 1)': {
                // 일요일
                color: '#f44336',
              },
              '&--outside-month': {
                color: '#ccc',
                '&:nth-of-type(7n)': {
                  color: '#a8d4ff', // 토요일
                },
                '&:nth-of-type(7n + 1)': {
                  color: '#ffb3b3', // 일요일
                },
              },
            },
          }}
        >
          <DatePicker
            locale={ko}
            selected={startDate}
            onChange={onChange}
            startDate={startDate}
            endDate={endDate}
            selectsRange
            inline
            monthsShown={2}
          />
        </DialogContent>

        <DialogActions
          sx={{
            margin: 'auto',
            padding: isMobile ? 2 : 1,
            position: isMobile ? 'sticky' : 'static',
            bottom: 0,
            backgroundColor: 'background.paper',
            borderTop: isMobile ? 1 : 0,
            borderColor: 'divider',
          }}
        >
          <SettingBtn
            autoFocus
            onClick={handleClose}
            sx={{ minWidth: isMobile ? '45%' : 100 }}
            btnType='cancel'
          >
            취소
          </SettingBtn>
          <SettingBtn
            autoFocus
            onClick={handleOk}
            sx={{ minWidth: isMobile ? '45%' : 100 }}
            btnType='confirm'
          >
            선택
          </SettingBtn>
        </DialogActions>
      </DlgBase>
    </React.Fragment>
  );
});

DlgDateRange.displayName = 'DlgDateRange';
export const useDlgDateRange = () => useRefComponent<Props>(DlgDateRange);
