import { forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, View } from 'react-native';
import { Chip } from '@/src/components/ui/chip';
import type {
  ExerciseRendererHandle,
  ExerciseRendererProps,
  SilentLetterContent,
} from '@/src/features/lesson/content';

export const SilentLetterRenderer = forwardRef<ExerciseRendererHandle, ExerciseRendererProps>(
  function SilentLetterRenderer({ exercise, checked, onCheck }, ref) {
    const content = exercise.content as unknown as SilentLetterContent;

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
          correctAnswer: content.letters[content.correct_index],
        }
      );
    };

    return (
      <View style={styles.chips}>
        {content.letters.map((letter, i) => (
          <Chip
            key={`${letter}-${i}`}
            label={letter}
            centered
            large
            selected={checked && i === content.correct_index}
            disabled={checked}
            onPress={() => grade(i)}
          />
        ))}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
});