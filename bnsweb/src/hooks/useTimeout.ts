import { useCallback, useEffect, useRef } from 'react';

export const useTimeout = (
  ms: number,
  start: boolean,
  callback: () => void
): { restart: () => void; clear: () => void } => {
  const ref = useRef<() => void>(callback);
  const refTimerId = useRef<any>(undefined);

  ref.current = callback;

  const restart = useCallback(() => {
    if (refTimerId.current) {
      clearTimeout(refTimerId.current);
    }
    const id = setTimeout(() => {
      refTimerId.current = undefined;
      ref.current();
    }, ms);
    refTimerId.current = id;
  }, [ms]);

  useEffect(() => {
    if (start) restart();
    return () => {
      if (refTimerId.current) clearTimeout(refTimerId.current);
    };
  }, [start, restart]);

  const clear = useCallback(() => {
    if (refTimerId.current) {
      clearTimeout(refTimerId.current);
      refTimerId.current = undefined;
    }
  }, []);

  return { restart, clear };
};
