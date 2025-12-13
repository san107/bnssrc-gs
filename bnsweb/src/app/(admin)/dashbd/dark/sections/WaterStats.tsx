import React, { useState } from 'react';
import { IfTbWater } from '@/models/water/tb_water';
import { ChartWaterStatsMonth } from '@/app/(admin)/dashbd/dark/chart/ChartWaterStatsMonth';
import { dateutil } from '@/utils/date-util';
import { DatePickerMonth } from '@/app/(admin)/comp/input/DatePickerMonth';

type Props = {
  selWater: IfTbWater;
};

export const WaterStats = ({ selWater }: Props) => {
  // const boxHeight = 470;
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
    <div className='col-xl-12'>
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
              <span className='card-category'>수위계 월별 통계</span>
              <h3 className='card-title'>{selWater?.water_nm}</h3>
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
          <ChartWaterStatsMonth water={selWater} date={dateutil.toYearMonth(selectedMonth)} />
        </div>
      </div>
    </div>
  );
};
