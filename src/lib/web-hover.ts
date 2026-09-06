import { Platform } from 'react-native';
import type { ViewStyle } from 'react-native';

export function hoverStyle(hovered: boolean): ViewStyle | undefined {
  if (Platform.OS !== 'web') return undefined;
  return {
    cursor: 'pointer',
    ...(hovered
      ? { transform: [{ translateY: -1 }], boxShadow: '0 6px 16px rgba(18, 40, 60, 0.12)' }
      : {}),
  };
}