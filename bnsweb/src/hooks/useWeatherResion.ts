import { create } from 'zustand';

export const useWeatherResionStore = create<{
  currentRegionName: string;
  setCurrentRegionName: (v: string) => void;
}>((set) => ({
  setCurrentRegionName: (v: string) => {
    set({ currentRegionName: v });
  },
  currentRegionName: '',
}));
