import { IfTbConfig, TbConfig } from '@/models/tb_config';
import { create } from 'zustand';

export const useConfigStore = create<{
  setConfig: (v: IfTbConfig) => void;
  config: IfTbConfig;
}>((set) => ({
  setConfig: (v: IfTbConfig) => set({ config: v }),
  config: new TbConfig(),
}));
