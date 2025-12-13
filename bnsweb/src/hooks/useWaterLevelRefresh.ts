import { create } from 'zustand';

type WaterLevelRefreshStore = {
  refreshTrigger: number;
  triggerRefresh: () => void;
  maxLevel: number;
  setMaxLevel: (maxLevel: number) => void;
};

export const useWaterLevelRefresh = create<WaterLevelRefreshStore>((set) => ({
  refreshTrigger: 0,
  triggerRefresh: () => set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),
  maxLevel: 0,
  setMaxLevel: (maxLevel) => set({ maxLevel }),
}));
