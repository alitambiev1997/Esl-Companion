import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
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
    const [wrongChips, setWrongChips] = useState<Set<number>>(new Set());
    const [found, setFound] = useState(false);
    const [revealed, setRevealed] = useState(false);
    const [selectedFix, setSelectedFix] = useState<number | null>(null);
    const [hintVisible, setHintVisible] = useState(false);
    const hintAnim = useRef(new Animated.Value(0)).current;
    const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
      return () => {
        if (hintTimer.current) clearTimeout(hintTimer.current);
      };
    }, []);

    useImperativeHandle(ref, () => ({ check: () => {} }));

    const hideHint = () => {
      if (hintTimer.current) clearTimeout(hintTimer.current);
      Animated.timing(hintAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() =>
        setHintVisible(false)
      );
    };

    const showHint = () => {
      setHintVisible(true);
      Animated.spring(hintAnim, { toValue: 1, useNativeDriver: true }).start();
      if (hintTimer.current) clearTimeout(hintTimer.current);
      hintTimer.current = setTimeout(hideHint, 2000);
    };

    const tapWord = (i: number) => {
      if (checked || found || revealed) return;
      if (i === content.wrong_index) {
        hideHint();
        setFound(true);
        return;
      }
      const nextWrong = new Set(wrongChips).add(i);
      setWrongChips(nextWrong);
      if (nextWrong.size >= 2) {
        hideHint();
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
        showHint();
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
      <View style={styles.container}>
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

        {hintVisible && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.hint,
              {
                opacity: hintAnim,
                transform: [
                  {
                    translateY: hintAnim.interpolate({ inputRange: [0, 1], outputRange: [60, 0] }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.hintText}>Almost! Try another word.</Text>
          </Animated.View>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
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
  hint: {
    position: 'absolute',
    bottom: 12,
    left: 24,
    right: 24,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.coral,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
  },
  hintText: {
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '600',
    color: colors.coral,
  },
});