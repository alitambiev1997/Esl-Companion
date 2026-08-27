import * as Haptics from 'expo-haptics';
import { useHapticsStore } from '@/src/store/haptics';

export function tapHaptic(): void {
  if (!useHapticsStore.getState().enabled) return;
  Haptics.selectionAsync();
}

export function successHaptic(): void {
  if (!useHapticsStore.getState().enabled) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

export function errorHaptic(): void {
  if (!useHapticsStore.getState().enabled) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
}

export function lightHaptic(): void {
  if (!useHapticsStore.getState().enabled) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}