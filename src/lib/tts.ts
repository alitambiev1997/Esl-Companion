import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

export function isSpeechAvailable(): boolean {
  if (Platform.OS !== 'web') return true;
  return typeof window !== 'undefined' && typeof window.speechSynthesis !== 'undefined';
}

export function speak(text: string, rate = 1): void {
  if (!isSpeechAvailable()) return;
  Speech.stop();
  Speech.speak(text, { rate });
}

export function stopSpeech(): void {
  if (!isSpeechAvailable()) return;
  Speech.stop();
}