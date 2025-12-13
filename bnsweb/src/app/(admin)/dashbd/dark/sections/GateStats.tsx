import { ChartGateStatsMonth } from '../chart/ChartGateStatsMonth';
import { IfTbGate } from '@/models/gate/tb_gate';
import React, { useState } from 'react';
import { dateutil } from '@/utils/date-util';
import { DatePickerMonth } from '@/app/(admin)/comp/input/DatePickerMonth';

type Props = {
  selGate: IfTbGate;
};

export const GateStats = ({ selGate }: Props) => {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

  const handleMonthChange = (date: Date | null) => {
    if (date) {
      setSelectedMonth(date);
    }
  };

  const handlePrevMonth = () => {
    const prevMonth = new Date(selectedMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setSelectedMonth(prevMonth);
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(selectedMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setSelectedMonth(nextMonth);
  };

  return (
    <div className='col-lg-12 col-md-12'>
      <div className='card card-chart'>
        <div className='card-header'>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <div>
              <h5 className='card-category'>차단장비 월별 통계</h5>
              <h3 className='card-title'>
                <i className='tim-icons icon-chart-bar-32 text-primary' /> {selGate.gate_nm}
              </h3>
            </div>
            <DatePickerMonth
              selectedDate={selectedMonth}
              onDateChange={handleMonthChange}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
            />
          </div>
        </div>
        <div className='card-body'>
          <ChartGateStatsMonth gate={selGate} date={dateutil.toYearMonth(selectedMonth)} />
        </div>
      </div>
    </div>
  );
};
