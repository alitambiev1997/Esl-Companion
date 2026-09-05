import { forwardRef, useEffect, useImperativeHandle } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Chip } from '@/src/components/ui/chip';
import { SlowButton, SpeakerButton } from '@/src/components/ui/speaker-button';
import type {
  ExerciseRendererHandle,
  ExerciseRendererProps,
  StressTapContent,
} from '@/src/features/lesson/content';
import { speak, stopSpeech } from '@/src/lib/tts';

export const StressTapRenderer = forwardRef<ExerciseRendererHandle, ExerciseRendererProps>(
  function StressTapRenderer({ exercise, checked, onCheck }, ref) {
    const content = exercise.content as unknown as StressTapContent;

    useEffect(() => {
      if (Platform.OS === 'web') return;
      speak(content.text_to_speak);
      return () => stopSpeech();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useImperativeHandle(ref, () => ({ check: () => {} }));

    const grade = (i: number) => {
      if (checked) return;
      const isCorrect = i === content.correct_index;
      onCheck(
        { selected_index: i },
        isCorrect,
        {
          correct: isCorrect,
          explanation: content.explanation,
          correctAnswer: content.syllables[content.correct_index],
        }
      );
    };

    return (
      <>
        <View style={styles.audioRow}>
          <SpeakerButton onPress={() => speak(content.text_to_speak)} />
          <SlowButton onPress={() => speak(content.text_to_speak, 0.6)} />
        </View>

        <View style={styles.chips}>
          {content.syllables.map((syllable, i) => (
            <Chip
              key={`${syllable}-${i}`}
              label={syllable}
              centered
              large
              selected={checked && i === content.correct_index}
              disabled={checked}
              onPress={() => grade(i)}
            />
          ))}
        </View>
      </>
    );
  }
);

const styles = StyleSheet.create({
  audioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
});