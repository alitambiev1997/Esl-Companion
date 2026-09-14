import { useWindowDimensions } from 'react-native';

export interface UiScale {
  isDesktop: boolean;
  parrot: number;
  medal: number;
}

export function useUiScale(): UiScale {
  const { width } = useWindowDimensions();
  if (width > 1400) return { isDesktop: true, parrot: 120, medal: 200 };
  if (width >= 900) return { isDesktop: true, parrot: 96, medal: 200 };
  return { isDesktop: false, parrot: 56, medal: 160 };
}