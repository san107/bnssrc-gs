'use client';
import '@/utils/axios-util';
import axios from 'axios';
import { ReactNode } from 'react';
import { SWRConfig } from 'swr';

function logger(useSWRNext) {
  return (key, fetcher, config) => {
    // 원본 fetcher에 logger를 추가합니다.
    const extendedFetcher = (...args) => {
      //console.log('SWR Request:', key);
      return fetcher(...args); // promise
    };
    // 새로운 fetcher로 hook을 실행합니다.
    return useSWRNext(key, extendedFetcher, config);
  };
}
export const SWRProvider = ({ children }: { children: ReactNode }) => {
  return (
    <SWRConfig
      value={{
        use: [logger],
        fetcher: swrFetcher,
        revalidateOnFocus: false,
        //revalidateIfStale: false, // 캐시되면 재요청하지 않음.(보통의 경우 사용하면 안됨.)
        revalidateOnReconnect: false,
      }}
    >
      {children}
    </SWRConfig>
  );
};

export const swrMutator = (url: string, { arg }: { arg: unknown }) => axios.post(url, arg);

export const swrMutatorData = (url: string, { arg }: { arg: unknown }) =>
  axios.post(url, arg).then((res) => res.data);

export const swrFetcher = ([url, params]: [string, unknown]) =>
  axios.get(url, { params }).then((res) => res.data);

export const swrPostFetcher = ([url, arg]: [string, unknown]) =>
  axios.post(url, arg).then((res) => res.data);
