import { create } from 'zustand';

export const useLoading = create<{
  cnt: number;
  inc: () => void;
  dec: () => void;
}>((set) => ({
  cnt: 0,
  inc: () =>
    set((state) => {
      return { cnt: state.cnt + 1 };
    }),
  dec: () =>
    set((state) => {
      if (state.cnt > 0) {
        return { cnt: state.cnt - 1 };
      }
      return { cnt: 0 };
    }),
}));
