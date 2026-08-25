import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { OptionCard } from '@/src/components/ui/option-card';
import type {
  ExerciseRendererHandle,
  ExerciseRendererProps,
  MultipleChoiceContent,
} from '@/src/features/lesson/content';

export const MultipleChoiceRenderer = forwardRef<
  ExerciseRendererHandle,
  ExerciseRendererProps
>(function MultipleChoiceRenderer({ exercise, checked, onCheck, onCanCheckChange }, ref) {
  const content = exercise.content as unknown as MultipleChoiceContent;
  const [selected, setSelected] = useState<number | null>(null);

  useImperativeHandle(ref, () => ({
    check: () => {
      if (selected === null) return;
      const isCorrect = selected === content.correct_index;
      onCheck(
        { selected_index: selected },
        isCorrect,
        {
          correct: isCorrect,
          explanation: content.explanation,
          correctAnswer: content.options[content.correct_index] ?? null,
        }
      );
    },
  }));

  useEffect(() => {
    onCanCheckChange(selected !== null);
  }, [selected, onCanCheckChange]);

  return (
    <>
      {content.options.map((option, i) => (
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

const styles = StyleSheet.create({
  spacing: {
    marginBottom: 12,
  },
});