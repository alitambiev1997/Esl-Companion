import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ExerciseRendererProps, WordOrderContent } from '@/src/features/lesson/content';
import { FeedbackPanel } from '@/src/features/lesson/feedback-panel';
import { ContinueButton, PrimaryButton } from '@/src/features/lesson/flow-buttons';
import { colors, fonts, radius } from '@/src/theme/tokens';

export function WordOrderRenderer({
  exercise,
  checked,
  busy,
  isLast,
  onCheck,
  onContinue,
}: ExerciseRendererProps) {
  const content = exercise.content as unknown as WordOrderContent;
  const [bank, setBank] = useState<string[]>(content.words);
  const [sequence, setSequence] = useState<string[]>([]);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);

  const moveToAnswer = (word: string) => {
    if (checked) return;
    setBank((prev) => prev.filter((w) => w !== word));
    setSequence((prev) => [...prev, word]);
  };

  const moveToBank = (word: string) => {
    if (checked) return;
    setSequence((prev) => prev.filter((w) => w !== word));
    setBank((prev) => [...prev, word]);
  };

  const check = () => {
    const isCorrect =
      sequence.length === content.correct_sequence.length &&
      sequence.every((word, i) => word === content.correct_sequence[i]);
    setLastCorrect(isCorrect);
    onCheck({ sequence }, isCorrect);
  };

  return (
    <>
      {sequence.length > 0 && (
        <View style={styles.answerRow}>
          {sequence.map((word) => (
            <Pressable key={word} style={styles.chip} onPress={() => moveToBank(word)}>
              <Text style={styles.chipText}>{word}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <View style={styles.bank}>
        {bank.map((word) => (
          <Pressable key={word} style={styles.chip} onPress={() => moveToAnswer(word)}>
            <Text style={styles.chipText}>{word}</Text>
          </Pressable>
        ))}
      </View>

      {!checked && (
        <PrimaryButton label="Check" onPress={check} disabled={bank.length > 0 || busy} />
      )}

      {checked && (
        <>
          <FeedbackPanel isCorrect={lastCorrect === true} explanation={content.explanation} />
          <ContinueButton isLast={isLast} onPress={onContinue} disabled={busy} />
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  answerRow: {
    minHeight: 56,
    borderWidth: 2,
    borderColor: colors.sky,
    borderRadius: radius.card,
    padding: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  bank: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    flexGrow: 0,
    flexShrink: 0,
    borderWidth: 2,
    borderColor: colors.grey,
    borderRadius: radius.bubble,
    paddingHorizontal: 16,
    paddingVertical: 10,
    margin: 4,
    backgroundColor: colors.paper,
  },
  chipText: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.ink,
    includeFontPadding: false,
  },
});