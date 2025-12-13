'use client';
// @flow
import { useEffect, useState } from 'react';

export const useDebounceValue = <T>(
  val: T,
  delay: number,
  callback: (v: T) => void
): [T, (val: T) => void] => {
  const [debouncedVal, setDebouncedVal] = useState(val);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (debouncedVal === val) return; // 동일한 경우, 처리할 필요 없음.
      callback(debouncedVal);
    }, delay);

    return () => clearTimeout(timer);
    // eslint-disable-next-line
  }, [debouncedVal, delay]);

  useEffect(() => {
    setDebouncedVal(val);
  }, [val]);

  return [debouncedVal, setDebouncedVal];
};
