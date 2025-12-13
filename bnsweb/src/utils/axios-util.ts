'use client';
import axios from 'axios';
import '@/utils/axios-util';
import { useLoading } from '@/store/useLoading';

axios.interceptors.response.use(
  (res) => {
    useLoading.getState().dec();
    return res;
  },
  (error) => {
    useLoading.getState().dec();
    const status = error?.response?.status;
    console.log('error', error?.response);
    if (401 === status || 403 === status) {
      document.location.href = '/login';
    } else {
      return Promise.reject(error);
    }
  }
);

axios.interceptors.request.use(
  (config) => {
    useLoading.getState().inc();
    return config;
  },
  (error) => {
    useLoading.getState().dec();
    return Promise.reject(error);
  }
);
