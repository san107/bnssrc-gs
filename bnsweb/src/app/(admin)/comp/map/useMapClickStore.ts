import { IfLatLngZoom, LatLngZoom } from '@/models/models';
import { create } from 'zustand';

export const useMapClickStore = create<{
  setClickInfo: (v: IfLatLngZoom) => void;
  clickInfo: IfLatLngZoom;
}>((set) => ({
  setClickInfo: (v: IfLatLngZoom) => set({ clickInfo: v }),
  clickInfo: new LatLngZoom(),
}));
