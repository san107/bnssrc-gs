import { create } from 'zustand';

type DevTypes = '' | 'gate' | 'camera' | 'water' | 'ebrd' | 'emcall' | 'emcallgrp';

export const useDrawerStore = create<{
  setDrawerType: (v: DevTypes) => void;
  drawerType: DevTypes;
}>((set) => ({
  setDrawerType: (v: DevTypes) => set({ drawerType: v }),
  drawerType: '',
}));
