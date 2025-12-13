import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SettingsState {
  theme: 'light' | 'dark';
  color: string;
  loginImage: string | null;
  mainImage: string | null;
  showWeather: boolean;
  showWeatherForecast: boolean;
  showWaterLocation: boolean;
  showWaterStatus: boolean;
  showWaterStats: boolean;
  showCameraList: boolean;
  showWaterList: boolean;
  showGateList: boolean;
  showGateStats: boolean;
  showEmcallList: boolean;
  showEbrdList: boolean;
  dashboardOrder: string[];
  setTheme: (theme: 'light' | 'dark') => void;
  setColor: (c: string) => void;
  setLoginImage: (image: string | null) => void;
  setMainImage: (image: string | null) => void;
  setShowWeather: (show: boolean) => void;
  setShowWeatherForecast: (show: boolean) => void;
  setShowWaterLocation: (show: boolean) => void;
  setShowWaterStatus: (show: boolean) => void;
  setShowWaterStats: (show: boolean) => void;
  setShowCameraList: (show: boolean) => void;
  setShowWaterList: (show: boolean) => void;
  setShowGateList: (show: boolean) => void;
  setShowGateStats: (show: boolean) => void;
  setShowEmcallList: (show: boolean) => void;
  setShowEbrdList: (show: boolean) => void;
  setDashboardOrder: (order: string[]) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'light',
      color: 'blue',
      loginImage: null,
      mainImage: null,
      showWeather: true,
      showWeatherForecast: true,
      showWaterLocation: true,
      showWaterStatus: true,
      showWaterStats: true,
      showCameraList: true,
      showWaterList: true,
      showGateList: true,
      showGateStats: true,
      showEmcallList: true,
      showEbrdList: true,
      dashboardOrder: [
        'weather',
        'weatherForecast',
        'waterLocation',
        'waterStatus',
        'waterStats',
        'gateStats',
        'cameraList',
        'waterList',
        'gateList',
        'ebrdList',
        'emcallList',
      ],
      setTheme: (theme) => set({ theme }),
      setColor: (color) => set({ color: color }),
      setLoginImage: (image) => set({ loginImage: image }),
      setMainImage: (image) => set({ mainImage: image }),
      setShowWeather: (show) => set({ showWeather: show }),
      setShowWeatherForecast: (show) => set({ showWeatherForecast: show }),
      setShowWaterLocation: (show) => set({ showWaterLocation: show }),
      setShowWaterStatus: (show) => set({ showWaterStatus: show }),
      setShowWaterStats: (show) => set({ showWaterStats: show }),
      setShowCameraList: (show) => set({ showCameraList: show }),
      setShowWaterList: (show) => set({ showWaterList: show }),
      setShowGateList: (show) => set({ showGateList: show }),
      setShowGateStats: (show) => set({ showGateStats: show }),
      setShowEmcallList: (show) => set({ showEmcallList: show }),
      setShowEbrdList: (show) => set({ showEbrdList: show }),
      setDashboardOrder: (order) => set({ dashboardOrder: order }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        color: state.color,
        loginImage: state.loginImage,
        mainImage: state.mainImage,
        showWeather: state.showWeather,
        showWeatherForecast: state.showWeatherForecast,
        showWaterLocation: state.showWaterLocation,
        showWaterStatus: state.showWaterStatus,
        showWaterStats: state.showWaterStats,
        showCameraList: state.showCameraList,
        showWaterList: state.showWaterList,
        showGateList: state.showGateList,
        showGateStats: state.showGateStats,
        showEmcallList: state.showEmcallList,
        showEbrdList: state.showEbrdList,
        dashboardOrder: state.dashboardOrder,
      }),
    }
  )
);
