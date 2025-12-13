function addZero(n) {
  return n < 10 ? '0' + n : n;
}
export const dateutil = {
  yyyymmdd: (date: Date) => {
    return date.getFullYear().toString() + addZero(date.getMonth() + 1) + addZero(date.getDate());
  },
  yyyymmdd_hhmmss: (date: Date) => {
    return (
      date.getFullYear().toString() +
      addZero(date.getMonth() + 1) +
      addZero(date.getDate()) +
      '_' +
      addZero(date.getHours()) +
      addZero(date.getMinutes()) +
      addZero(date.getSeconds())
    );
  },
  toSaveDate: (date: Date | null | undefined) => {
    if (!date) return '';
    return [
      date.getFullYear().toString(),
      '-',
      addZero(date.getMonth() + 1),
      '-',
      addZero(date.getDate()),
      'T',
      addZero(date.getHours()),
      ':',
      addZero(date.getMinutes()),
      ':',
      addZero(date.getSeconds()),
    ].join('');
  },
  toSaveDateZeroTime: (date: Date | null | undefined) => {
    if (!date) return '';
    return [
      date.getFullYear().toString(),
      '-',
      addZero(date.getMonth() + 1),
      '-',
      addZero(date.getDate()),
      'T',
      addZero(date.getHours()),
      ':',
      addZero(date.getMinutes()),
      ':',
      addZero(date.getSeconds()),
    ].join('');
  },
  toStartDateZeroTime: (date: Date | null | undefined) => {
    if (!date) return '';
    return [
      date.getFullYear().toString(),
      '-',
      addZero(date.getMonth() + 1),
      '-',
      addZero(date.getDate()),
      'T',
      addZero(0),
      ':',
      addZero(0),
      ':',
      addZero(0),
    ].join('');
  },
  toEndDateZeroTime: (date: Date | null | undefined) => {
    if (!date) return '';
    return [
      date.getFullYear().toString(),
      '-',
      addZero(date.getMonth() + 1),
      '-',
      addZero(date.getDate()),
      'T',
      addZero(23),
      ':',
      addZero(59),
      ':',
      addZero(59),
    ].join('');
  },
  toYearMonth: (date: Date) => {
    return date.getFullYear().toString() + '-' + addZero(date.getMonth() + 1);
  },
  addDays: (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },
};
