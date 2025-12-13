const gethh = (hhmm?: string): string => {
  if (!hhmm) return '';
  return (hhmm || '0000').slice(0, 2).padStart(2, '0');
};

const getmm = (hhmm?: string): string => {
  if (!hhmm) return '';
  return (hhmm || '0000').slice(2, 4).padStart(2, '0');
};

const sethh = (hhmm?: string, hh?: string): string => {
  return (hh || '00').padStart(2, '0') + (hhmm || '0000').slice(2);
};

const setmm = (hhmm?: string, mm?: string): string => {
  return (hhmm || '0000').slice(0, 2) + (mm || '00').padStart(2, '0');
};

// yyyymmddhhmm

const getymd = (yyyymmddhhmm?: string): string => {
  if (!yyyymmddhhmm) return '';
  return yyyymmddhhmm.slice(0, 8);
};

const gethour = (yyyymmddhhmm?: string): string => {
  if (!yyyymmddhhmm) return '';
  return yyyymmddhhmm.slice(8, 10);
};

const getminute = (yyyymmddhhmm?: string): string => {
  if (!yyyymmddhhmm) return '';
  return yyyymmddhhmm.slice(10, 12);
};

const sethour = (yyyymmddhhmm?: string, hour?: string): string => {
  const d = yyyymmddhhmm || '202501010000';
  return d.slice(0, 8) + (hour || '00').padStart(2, '0') + d.slice(10);
};

const setminute = (yyyymmddhhmm?: string, minute?: string): string => {
  const d = yyyymmddhhmm || '202501010000';
  return d.slice(0, 10) + (minute || '00').padStart(2, '0') + d.slice(12);
};

const setymd = (yyyymmddhhmm?: string, ymd?: string): string => {
  const d = yyyymmddhhmm || '202501010000';
  return (ymd || '00000000').padStart(8, '0') + d.slice(8);
};

const getymdhm = (d: Date | undefined) => {
  if (!d) return undefined;
  return (
    d.getFullYear().toString().padStart(4, '0') +
    (d.getMonth() + 1).toString().padStart(2, '0') +
    d.getDate().toString().padStart(2, '0') +
    d.getHours().toString().padStart(2, '0') +
    d.getMinutes().toString().padStart(2, '0')
  );
};
const getdate = (yyyymmddhhmm?: string): Date | undefined => {
  if (!yyyymmddhhmm) return undefined;
  const d = yyyymmddhhmm || '202501010000';
  return new Date(
    Number(d.slice(0, 4)),
    Number(d.slice(4, 6)) - 1,
    Number(d.slice(6, 8)),
    Number(d.slice(8, 10)),
    Number(d.slice(10, 12))
  );
};

const gettoday = (): string => {
  const d = new Date();
  return getymd(getymdhm(d));
};

export const ymd = {
  getymdhm,
  getdate,
  getymd,
  gethour,
  getminute,
  setymd,
  sethour,
  setminute,
  gettoday,
};

export const hm = {
  gethh,
  getmm,
  sethh,
  setmm,
};
