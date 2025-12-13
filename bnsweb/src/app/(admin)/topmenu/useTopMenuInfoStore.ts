import { create } from 'zustand';

export class TopMenuInfoFalse implements IfTopMenuInfo {
  camera: boolean = false;
  gate: boolean = false;
  water: boolean = false;
  emcall: boolean = false; // 비상통화장치
  emcallgrp: boolean = false; // 비상통화장치 그룹
  ebrd: boolean = false; // 전광판
}
export class TopMenuInfoTrue implements IfTopMenuInfo {
  camera: boolean = true;
  gate: boolean = true;
  water: boolean = true;
  emcall: boolean = true; // 비상통화장치
  emcallgrp: boolean = true; // 비상통화장치 그룹
  ebrd: boolean = true; // 전광판
}

interface IfTopMenuInfo {
  camera: boolean;
  gate: boolean;
  water: boolean;
  emcall: boolean;
  emcallgrp: boolean;
  ebrd: boolean;
}

export const useTopMenuStore = create<{
  setTopMenuInfo: (v: IfTopMenuInfo) => void;
  topMenuInfo: IfTopMenuInfo;
}>((set) => ({
  setTopMenuInfo: (v: IfTopMenuInfo) => set({ topMenuInfo: v }),
  topMenuInfo: new TopMenuInfoTrue(),
}));
