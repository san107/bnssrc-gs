'use client';
import { useMounted } from '@/hooks/useMounted';
import { useState } from 'react';

function useLocalStorage<T>(
  key: string,
  initialValue: T,
  receiver?: (key: string, value: string) => void
) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item, receiver) : initialValue;
    } catch (error) {
      console.error('E', error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error('E', error);
    }
  };

  const mounted = useMounted();

  if (mounted) {
    return [storedValue, setValue] as const;
  }

  return [initialValue, setValue] as const;

  //return [storedValue, setValue] as const;
}

export { useLocalStorage };
