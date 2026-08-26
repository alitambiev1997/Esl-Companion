import { forwardRef, useImperativeHandle, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Chip } from '@/src/components/ui/chip';
import { OptionCard } from '@/src/components/ui/option-card';
import type {
  ErrorSpotContent,
  ExerciseRendererHandle,
  ExerciseRendererProps,
} from '@/src/features/lesson/content';
import { colors, fonts } from '@/src/theme/tokens';

export const ErrorSpotRenderer = forwardRef<ExerciseRendererHandle, ExerciseRendererProps>(
  function ErrorSpotRenderer({ exercise, checked, onCheck }, ref) {
    const content = exercise.content as unknown as ErrorSpotContent;
    const [selectedWord, setSelectedWord] = useState<number | null>(null);
    const [selectedFix, setSelectedFix] = useState<number | null>(null);

    useImperativeHandle(ref, () => ({ check: () => {} }));

    const grade = (fixIndex: number) => {
      if (selectedWord === null || checked) return;
      const isCorrect =
        selectedWord === content.wrong_index && fixIndex === content.correct_index;
      setSelectedFix(fixIndex);
      onCheck(
        { tapped_word: selectedWord, fix: fixIndex },
        isCorrect,
        {
          correct: isCorrect,
          explanation: content.explanation,
          correctAnswer: isCorrect
            ? null
            : `Mistake: "${content.words[content.wrong_index]}" → Fix: "${content.options[content.correct_index]}"`,
        }
      );
    };

    return (
      <>
        <View style={styles.sentence}>
          {content.words.map((word, i) => (
            <Chip
              key={`${word}-${i}`}
              label={word}
              centered
              selected={selectedWord === i}
              disabled={checked}
              onPress={() => {
                if (!checked) setSelectedWord(i);
              }}
            />
          ))}
        </View>

        {selectedWord !== null && !checked && (
          <>
            <Text style={styles.fixLabel}>Fix it:</Text>
            {content.options.map((option, i) => (
              <View key={i} style={styles.spacing}>
                <OptionCard label={option} selected={selectedFix === i} onPress={() => grade(i)} />
              </View>
            ))}
          </>
        )}
      </>
    );
  }
);

const styles = StyleSheet.create({
  sentence: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  fixLabel: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.ink,
    marginBottom: 12,
  },
  spacing: {
    marginBottom: 12,
  },
});