import { create } from 'zustand';
import { Map as OlMap } from 'ol';

export const mapStore = create<{
  //   map: Map;
  map: OlMap | null;
  setMap: (v: OlMap | null) => void;
}>((set) => ({
  //   map: new Map(), // 처음 로딩시 오류로 any로 처리
  map: null,
  setMap: (v: OlMap | null) => set({ map: v }),
}));

export const useMapOl = (): OlMap | null => {
  const { map } = mapStore();
  return map;
};
