import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const STORAGE_KEY = 'haptics_enabled';

interface HapticsState {
  enabled: boolean;
  toggle: () => void;
  load: () => Promise<void>;
}

export const useHapticsStore = create<HapticsState>((set, get) => ({
  enabled: true,
  toggle: () => {
    const next = !get().enabled;
    set({ enabled: next });
    AsyncStorage.setItem(STORAGE_KEY, String(next));
  },
  load: async () => {
    const value = await AsyncStorage.getItem(STORAGE_KEY);
    if (value !== null) set({ enabled: value === 'true' });
  },
}));