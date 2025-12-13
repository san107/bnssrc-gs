import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { styled } from '@mui/material';
import { Box } from '@mui/material';
import ArrowCircleLeftIcon from '@mui/icons-material/ArrowCircleLeft';
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
import { ko } from 'date-fns/locale';

export const StyledDatePicker = styled(DatePicker)`
  border: none;
  outline: none;
  box-shadow: none;
  background-color: transparent;
  color: inherit;
  font-size: 18px;
  padding: 8px 12px;
  cursor: pointer;
  text-align: center;
  width: 130px;
  &:hover {
    border-color: #2196f3;
  }
  &:focus {
    border: none;
    outline: none;
    box-shadow: none;
  }
`;

export const NavigationButton = styled('button')`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.2s ease;
  &:focus {
    outline: none !important;
    border: none !important;
    box-shadow: none !important;
  }
  &:hover {
    color: #2196f3;
    background-color: rgba(33, 150, 243, 0.1);
  }
`;

export const DatePickerContainer = styled('div')`
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.05);
  padding: 0px 8px;
  border-radius: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

export const DatePickerWrapper = styled(Box)`
  .react-datepicker-wrapper {
    display: inline-block;
  }
  .react-datepicker-popper {
    z-index: 1000;
  }
  .react-datepicker {
    font-family: inherit;
    border: none;
    border-radius: 16px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    padding: 0;
    background-color: #fff;
    overflow: hidden;
  }
  .react-datepicker__header {
    background-color: transparent;
    border-bottom: none;
    padding: 0;
    position: relative;
  }
  .react-datepicker__current-month {
    background-color: #fff;
    padding: 0.75rem 0;
    font-size: 1rem;
    font-weight: 600;
    color: #1976d2 !important;
    position: relative;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    border-bottom: 1px solid #f0f0f0;
  }
  .react-datepicker__navigation {
    position: absolute;
    top: 0.75rem;
    transform: none;
    padding: 0;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    background-color: transparent;
    z-index: 1;
    border: none;
    transition: all 0.2s ease;
    outline: none;
    &:hover {
      background-color: rgba(25, 118, 210, 0.08);
      border-radius: 50%;
    }
    &:focus {
      outline: none;
      border: none;
      box-shadow: none;
    }
    &--previous {
      left: 0.5rem;
    }
    &--next {
      right: 0.5rem;
    }
  }
  .react-datepicker__navigation-icon {
    position: relative;
    display: block;
    width: 0;
    height: 0;
    &::before {
      content: '';
      display: block;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(45deg);
      border-style: solid;
      border-width: 2px 2px 0 0;
      width: 8px;
      height: 8px;
      border-color: #1976d2;
    }
  }
  .react-datepicker__navigation-icon--next::before {
    transform: translate(-75%, -50%) rotate(45deg);
  }
  .react-datepicker__navigation-icon--previous::before {
    transform: translate(-25%, -50%) rotate(-135deg);
  }
  .react-datepicker__day-names {
    display: flex;
    justify-content: space-around;
    margin: 0;
    background-color: #fff;
    padding: 0.5rem 10px;
    border-bottom: 1px solid #f0f0f0;
  }
  .react-datepicker__day-name {
    width: 2.25rem;
    margin: 0;
    color: #666;
    font-weight: 500;
    font-size: 0.85rem;
    &:first-of-type {
      color: #f44336;
    }
    &:last-of-type {
      color: #1976d2;
    }
  }
  .react-datepicker__month-container {
    float: none;
    padding: 16px 0 0 0;
  }
  .react-datepicker__month {
    margin: 0.25rem 0;
    padding: 0 10px;
  }
  .react-datepicker__week {
    display: flex;
    justify-content: space-around;
  }
  .react-datepicker__day {
    width: 2.25rem;
    line-height: 2.25rem;
    height: 2.25rem;
    margin: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-size: 0.9rem;
    transition: all 0.2s ease;
    &:hover {
      background-color: rgba(25, 118, 210, 0.08);
      border-radius: 50%;
    }
    &--selected {
      background-color: #1976d2 !important;
      color: white !important;
      font-weight: 600;
      &:hover {
        background-color: #1565c0 !important;
      }
    }
    &--keyboard-selected {
      background-color: #1976d2 !important;
      color: white !important;
      font-weight: 600;
      &:hover {
        background-color: #1565c0 !important;
      }
    }
    &:nth-of-type(7n) {
      color: #1976d2;
    }
    &:nth-of-type(7n + 1) {
      color: #f44336;
    }
    &--outside-month {
      color: #ccc;
      &:nth-of-type(7n) {
        color: #90caf9;
      }
      &:nth-of-type(7n + 1) {
        color: #ffcdd2;
      }
    }
    &--today {
      font-weight: 600;
      color: #1976d2;
      background-color: rgba(25, 118, 210, 0.08);
    }
  }
  .react-datepicker__month-text {
    display: inline-block;
    width: 3.5rem;
    margin: 0.25rem;
    text-align: center;
    padding: 0.5rem 0.25rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s ease;
    &:hover {
      background-color: rgba(25, 118, 210, 0.08);
    }
    &--selected {
      background-color: #1976d2 !important;
      color: white !important;
      font-weight: 600;
      &:hover {
        background-color: #1565c0 !important;
      }
    }
    &--keyboard-selected {
      background-color: #1976d2 !important;
      color: white !important;
      font-weight: 600;
      &:hover {
        background-color: #1565c0 !important;
      }
    }
  }
  .react-datepicker__year {
    margin: 0.25rem 0;
    padding: 0 0.25rem;
  }
  .react-datepicker__year-text {
    display: inline-block;
    width: 3.5rem;
    margin: 0.25rem;
    text-align: center;
    padding: 0.5rem 0.25rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s ease;
    &:hover {
      background-color: rgba(25, 118, 210, 0.08);
    }
    &--selected {
      background-color: #1976d2 !important;
      color: white !important;
      font-weight: 600;
      &:hover {
        background-color: #1565c0 !important;
      }
    }
    &--keyboard-selected {
      background-color: #1976d2 !important;
      color: white !important;
      font-weight: 600;
      &:hover {
        background-color: #1565c0 !important;
      }
    }
  }
  .react-datepicker__month-dropdown-container,
  .react-datepicker__year-dropdown-container {
    margin: 0 0.25rem;
    padding: 0.25rem;
    border-radius: 6px;
    background-color: #f8f9fa;
    &:hover {
      background-color: rgba(25, 118, 210, 0.08);
    }
  }
  .react-datepicker__month-dropdown,
  .react-datepicker__year-dropdown {
    border: none;
    background-color: transparent;
    color: #1976d2;
    font-weight: 500;
    cursor: pointer;
    padding: 0.15rem 0.25rem;
    border-radius: 4px;
    &:focus {
      outline: none;
      background-color: rgba(25, 118, 210, 0.08);
    }
  }
`;

export const DatePickerMonth = ({
  selectedDate,
  onDateChange,
  onPrevMonth,
  onNextMonth,
}: {
  selectedDate: Date;
  onDateChange: (date: Date | null) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}) => {
  return (
    <DatePickerWrapper>
      <DatePickerContainer>
        <NavigationButton onClick={onPrevMonth}>
          <ArrowCircleLeftIcon />
        </NavigationButton>
        <StyledDatePicker
          selected={selectedDate}
          onChange={onDateChange}
          dateFormat='yyyy-MM'
          showMonthYearPicker
          locale={ko}
          popperPlacement='bottom-end'
        />
        <NavigationButton onClick={onNextMonth}>
          <ArrowCircleRightIcon />
        </NavigationButton>
      </DatePickerContainer>
    </DatePickerWrapper>
  );
};
