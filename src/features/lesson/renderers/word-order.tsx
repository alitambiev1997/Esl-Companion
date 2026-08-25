import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Chip } from '@/src/components/ui/chip';
import type {
  ExerciseRendererHandle,
  ExerciseRendererProps,
  WordOrderContent,
} from '@/src/features/lesson/content';
import { colors, fonts } from '@/src/theme/tokens';

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export const WordOrderRenderer = forwardRef<ExerciseRendererHandle, ExerciseRendererProps>(
  function WordOrderRenderer({ exercise, checked, onCheck, onCanCheckChange }, ref) {
    const content = exercise.content as unknown as WordOrderContent;
    const [bankOrder] = useState(() => shuffle(content.words));
    const [answer, setAnswer] = useState<string[]>([]);

    useImperativeHandle(ref, () => ({
      check: () => {
        const isCorrect =
          answer.length === content.correct_sequence.length &&
          answer.every((w, i) => w === content.correct_sequence[i]);
        onCheck(
          { sequence: answer },
          isCorrect,
          {
            correct: isCorrect,
            explanation: content.explanation,
            correctAnswer: null,
            chips: content.correct_sequence,
          }
        );
      },
    }));

    useEffect(() => {
      onCanCheckChange(answer.length === bankOrder.length);
    }, [answer, bankOrder, onCanCheckChange]);

    const tapToAnswer = (word: string) => {
      if (checked) return;
      setAnswer((prev) => [...prev, word]);
    };

    const tapToBank = (word: string) => {
      if (checked) return;
      setAnswer((prev) => prev.filter((w) => w !== word));
    };

    return (
      <>
        <View style={styles.answerArea}>
          {answer.length === 0 && <Text style={styles.emptyHint}>Tap the words below</Text>}
          {answer.map((word, i) => (
            <Chip
              key={`${word}-${i}`}
              label={word}
              centered
              disabled={checked}
              onPress={() => tapToBank(word)}
            />
          ))}
        </View>

        <View style={styles.bank}>
          {bankOrder.map((word, i) => {
            const used = answer.includes(word);
            return (
              <View key={`${word}-${i}`} style={used && styles.hidden}>
                <Chip
                  label={word}
                  centered
                  disabled={checked || used}
                  onPress={() => tapToAnswer(word)}
                />
              </View>
            );
          })}
        </View>
      </>
    );
  }
);

const styles = StyleSheet.create({
  answerArea: {
    minHeight: 64,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    borderBottomWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.grey,
    paddingBottom: 8,
    marginBottom: 16,
  },
  emptyHint: {
    position: 'absolute',
    top: 4,
    left: 4,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    opacity: 0.4,
  },
  bank: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  hidden: {
    opacity: 0,
  },
});