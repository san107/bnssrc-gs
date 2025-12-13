import { useRef } from 'react';

export const usePromise = <T, R>() => {
  const promise = useRef<{
    resolve: ((value: T | PromiseLike<T>) => Promise<T>) | ((value: T) => void) | undefined;
    reject: ((reason?: R) => Promise<R>) | ((value: R) => void) | undefined;
  }>({
    resolve: undefined,
    reject: undefined,
  });
  return promise;
};
