import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Chip } from '@/src/components/ui/chip';
import { OptionCard } from '@/src/components/ui/option-card';
import type {
  ErrorSpotContent,
  ExerciseRendererHandle,
  ExerciseRendererProps,
} from '@/src/features/lesson/content';
import { colors, fonts } from '@/src/theme/tokens';

const TRY_AGAIN_HINT = 'Almost! Try another word.';

export const ErrorSpotRenderer = forwardRef<ExerciseRendererHandle, ExerciseRendererProps>(
  function ErrorSpotRenderer({ exercise, checked, onCheck, onHint }, ref) {
    const content = exercise.content as unknown as ErrorSpotContent;
    const [wrongChips, setWrongChips] = useState<Set<number>>(new Set());
    const [found, setFound] = useState(false);
    const [revealed, setRevealed] = useState(false);
    const [selectedFix, setSelectedFix] = useState<number | null>(null);
    const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
      return () => {
        if (hintTimer.current) clearTimeout(hintTimer.current);
        onHint?.(null);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useImperativeHandle(ref, () => ({ check: () => {} }));

    const clearHint = () => {
      if (hintTimer.current) clearTimeout(hintTimer.current);
      onHint?.(null);
    };

    const notifyHint = () => {
      onHint?.(TRY_AGAIN_HINT);
      if (hintTimer.current) clearTimeout(hintTimer.current);
      hintTimer.current = setTimeout(() => onHint?.(null), 2000);
    };

    const tapWord = (i: number) => {
      if (checked || found || revealed) return;
      if (i === content.wrong_index) {
        clearHint();
        setFound(true);
        return;
      }
      const nextWrong = new Set(wrongChips).add(i);
      setWrongChips(nextWrong);
      if (nextWrong.size >= 2) {
        clearHint();
        setRevealed(true);
        onCheck(
          { tapped_word: i },
          false,
          {
            correct: false,
            explanation: content.explanation,
            correctAnswer: `Mistake: "${content.words[content.wrong_index]}" → Fix: "${content.options[content.correct_index]}"`,
          }
        );
      } else {
        notifyHint();
      }
    };

    const grade = (fixIndex: number) => {
      if (!found || checked) return;
      const isCorrect = fixIndex === content.correct_index;
      setSelectedFix(fixIndex);
      onCheck(
        { fix: fixIndex },
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
      <View>
        <View style={styles.sentence}>
          {content.words.map((word, i) => (
            <Chip
              key={`${word}-${i}`}
              label={word}
              centered
              tone={
                found && i === content.wrong_index
                  ? 'leaf'
                  : revealed && i === content.wrong_index
                    ? 'sun'
                    : undefined
              }
              wrong={wrongChips.has(i)}
              disabled={checked || wrongChips.has(i)}
              onPress={() => tapWord(i)}
            />
          ))}
        </View>

        {found && !checked && (
          <>
            <Text style={styles.fixLabel}>Fix it:</Text>
            {content.options.map((option, i) => (
              <View key={i} style={styles.spacing}>
                <OptionCard label={option} selected={selectedFix === i} onPress={() => grade(i)} />
              </View>
            ))}
          </>
        )}
      </View>
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