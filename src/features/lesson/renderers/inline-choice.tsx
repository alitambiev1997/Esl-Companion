import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { OptionCard } from '@/src/components/ui/option-card';
import type {
  ExerciseRendererHandle,
  ExerciseRendererProps,
  InlineChoiceContent,
} from '@/src/features/lesson/content';
import { colors, fonts } from '@/src/theme/tokens';

export const InlineChoiceRenderer = forwardRef<ExerciseRendererHandle, ExerciseRendererProps>(
  function InlineChoiceRenderer({ exercise, checked, onCheck, onCanCheckChange }, ref) {
    const content = exercise.content as unknown as InlineChoiceContent;
    const [selected, setSelected] = useState<number | null>(null);
    const parts = content.sentence.split('___');

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
            tip: content.tip ?? null,
          }
        );
      },
    }));

    useEffect(() => {
      onCanCheckChange(selected !== null);
    }, [selected, onCanCheckChange]);

    return (
      <>
        <Text style={styles.sentence}>
          {parts[0]}
          <Text style={[styles.slot, selected !== null && styles.slotFilled]}>
            {selected !== null ? content.options[selected] : '___'}
          </Text>
          {parts.slice(1).join('')}
        </Text>

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
  }
);

const styles = StyleSheet.create({
  sentence: {
    fontFamily: fonts.body,
    fontSize: 20,
    lineHeight: 28,
    color: colors.ink,
    marginBottom: 24,
  },
  slot: {
    textDecorationLine: 'underline',
    color: colors.ink,
    opacity: 0.4,
  },
  slotFilled: {
    opacity: 1,
    fontWeight: '700',
  },
  spacing: {
    marginBottom: 12,
  },
});