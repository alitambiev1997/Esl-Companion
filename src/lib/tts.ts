import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

export function isSpeechAvailable(): boolean {
  if (Platform.OS !== 'web') return true;
  return typeof window !== 'undefined' && typeof window.speechSynthesis !== 'undefined';
}

let voicesLoaded = false;
let voicesRetry: ReturnType<typeof setTimeout> | null = null;

function ensureVoices(): void {
  if (Platform.OS !== 'web') return;
  const synth = window.speechSynthesis;
  if (!synth || voicesLoaded) return;

  const load = () => {
    if (synth.getVoices().length > 0) {
      voicesLoaded = true;
      if (voicesRetry) {
        clearTimeout(voicesRetry);
        voicesRetry = null;
      }
      return;
    }
    if (voicesRetry) clearTimeout(voicesRetry);
    voicesRetry = setTimeout(load, 250);
  };

  synth.addEventListener('voiceschanged', load);
  load();
}

function speakWeb(text: string, rate: number): void {
  const synth = window.speechSynthesis;
  if (!synth) return;
  ensureVoices();
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = rate || 1;
  utterance.onerror = (event) => {
    if (event.error !== 'interrupted' && event.error !== 'canceled') {
      console.warn('[tts] speech failed', event.error);
    }
  };
  synth.speak(utterance);
}

export function speak(text: string, rate = 1): void {
  if (!isSpeechAvailable()) return;
  if (Platform.OS === 'web') {
    speakWeb(text, rate);
    return;
  }
  Speech.stop();
  Speech.speak(text, { rate });
}

export function stopSpeech(): void {
  if (!isSpeechAvailable()) return;
  if (Platform.OS === 'web') {
    window.speechSynthesis.cancel();
    return;
  }
  Speech.stop();
}