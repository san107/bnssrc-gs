import { useEffect, useState } from 'react';

const map: { [v: number]: (() => void)[] } = {};

export const refreshImg = (file_seq?: number | null) => {
  if (!file_seq) return;
  if (map[file_seq]) {
    map[file_seq].forEach((v) => v());
  }
};

export const refreshImgAll = () => {
  Object.keys(map).forEach((v) => refreshImg(Number(v)));
};

export const useImgRefresh = (file_seq: number, callback: () => void) => {
  useEffect(() => {
    if (!map[file_seq]) {
      map[file_seq] = [];
    }
    map[file_seq].push(callback);
    return () => {
      map[file_seq] = map[file_seq].filter((v) => v !== callback);
    };
  }, [callback, file_seq]);
};

export const useImgRefreshInt = (file_seq?: number | null): number => {
  const [cnt, setCnt] = useState(0);
  useEffect(() => {
    if (!file_seq) return;

    const callback = () => setCnt((c) => c + 1);
    if (!map[file_seq]) {
      map[file_seq] = [];
    }
    map[file_seq].push(callback);
    return () => {
      map[file_seq] = map[file_seq].filter((v) => v !== callback);
    };
  }, [file_seq]);

  return cnt;
};

export const useImgRefreshDate = (file_seq?: number | null): number => {
  const [date, setDate] = useState(new Date().getTime());
  useEffect(() => {
    if (!file_seq) return;

    const callback = () => setDate(new Date().getTime());
    if (!map[file_seq]) {
      map[file_seq] = [];
    }
    map[file_seq].push(callback);
    return () => {
      map[file_seq] = map[file_seq].filter((v) => v !== callback);
    };
  }, [file_seq]);

  return date;
};
