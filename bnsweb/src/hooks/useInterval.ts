import { useCallback, useEffect, useRef } from 'react';

export const useInterval = (
  ms: number,
  start: boolean,
  callback: () => void
): { restart: () => void; clear: () => void } => {
  const ref = useRef<() => void>(callback);
  const refTimerId = useRef<any>(undefined);

  ref.current = callback;

  const restart = useCallback(() => {
    if (refTimerId.current) {
      clearInterval(refTimerId.current);
    }
    const id = setInterval(() => {
      ref.current();
    }, ms);
    refTimerId.current = id;
  }, [ms]);

  useEffect(() => {
    if (start) restart();
    return () => {
      if (refTimerId.current) clearInterval(refTimerId.current);
    };
  }, [restart, start]);

  const clear = useCallback(() => {
    if (refTimerId.current) {
      clearInterval(refTimerId.current);
      refTimerId.current = undefined;
    }
  }, []);

  return { restart, clear };
};
