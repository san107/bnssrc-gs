export const tofixed = (n: number, d: number): number => {
  const scale = Math.pow(10, d);
  return Math.round(n * scale) / scale;
};

export const tofixedceil = (n: number, d: number): number => {
  const scale = Math.pow(10, d);
  return Math.ceil(n * scale) / scale;
};

export const latlngfixed = (n: number): number => {
  const scale = 10000000;
  return Math.round(n * scale) / scale;
};

export const zoomfixed = (n: number): number => {
  const scale = 100;
  return Math.round(n * scale) / scale;
};

export const nstr = (n: number | undefined | null): string => {
  if (n === null || n === undefined) return '';
  if (isNaN(n)) return '';

  return n.toString();
};
