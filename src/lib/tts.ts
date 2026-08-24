import * as Speech from 'expo-speech';

export function speak(text: string, rate = 1): void {
  Speech.stop();
  Speech.speak(text, { rate });
}

export function stopSpeech(): void {
  Speech.stop();
}