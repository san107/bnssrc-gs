import { useRef } from 'react';

export const useRefCtx = <T>(t: T) => {
  const ref = useRef<T>(null);
  ref.current = t;
  return ref;
};
