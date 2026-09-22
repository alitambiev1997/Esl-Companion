import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { OptionCard } from '@/src/components/ui/option-card';
import { SlowButton, SpeakerButton } from '@/src/components/ui/speaker-button';
import type {
  ExerciseRendererHandle,
  ExerciseRendererProps,
  ListeningMultipleChoiceContent,
} from '@/src/features/lesson/content';
import { speak, stopSpeech } from '@/src/lib/tts';

export const ListeningMultipleChoiceRenderer = forwardRef<
  ExerciseRendererHandle,
  ExerciseRendererProps
>(function ListeningMultipleChoiceRenderer({ exercise, checked, onCheck, onCanCheckChange }, ref) {
  const content = exercise.content as unknown as ListeningMultipleChoiceContent;
  const options = content.options;

  const [orderState, setOrderState] = useState(() => ({
    length: options.length,
    order: shuffledIndexes(options.length),
  }));
  if (orderState.length !== options.length) {
    setOrderState({ length: options.length, order: shuffledIndexes(options.length) });
  }
  const ordered = orderState.order.map((index) => options[index]);
  const correctIndex = orderState.order.indexOf(content.correct_index);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    speak(content.text_to_speak);
    return () => stopSpeech();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useImperativeHandle(ref, () => ({
    check: () => {
      if (selected === null) return;
      const isCorrect = selected === correctIndex;
      onCheck(
        { selected_index: selected },
        isCorrect,
        {
          correct: isCorrect,
          explanation: content.explanation ?? content.text_to_speak,
          correctAnswer: options[content.correct_index] ?? null,
        }
      );
    },
  }));

  useEffect(() => {
    onCanCheckChange(selected !== null);
  }, [selected, onCanCheckChange]);

  return (
    <>
      <View style={styles.audioRow}>
        <SpeakerButton onPress={() => speak(content.text_to_speak)} />
        <SlowButton onPress={() => speak(content.text_to_speak, 0.6)} />
      </View>
      {ordered.map((option, i) => (
        <View key={i} style={styles.spacing}>
          <OptionCard
            label={option}
            selected={selected === i}
            disabled={checked}
            onPress={() => {
              if (!checked) setSelected(i);
            }}
          />
        </View>
      ))}
    </>
  );
});

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function shuffledIndexes(count: number): number[] {
  const base = Array.from({ length: count }, (_, i) => i);
  const result = shuffle(base);
  if (result.every((v, i) => v === base[i]) && result.length > 1) {
    [result[0], result[1]] = [result[1], result[0]];
  }
  return result;
}

const styles = StyleSheet.create({
  audioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  spacing: {
    marginBottom: 12,
  },
});