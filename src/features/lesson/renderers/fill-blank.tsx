import { useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';
import type { ExerciseRendererProps, FillBlankContent } from '@/src/features/lesson/content';
import { FeedbackPanel } from '@/src/features/lesson/feedback-panel';
import { ContinueButton, PrimaryButton } from '@/src/features/lesson/flow-buttons';
import { colors, fonts, radius } from '@/src/theme/tokens';

export function FillBlankRenderer({
  exercise,
  checked,
  busy,
  isLast,
  onCheck,
  onContinue,
}: ExerciseRendererProps) {
  const content = exercise.content as unknown as FillBlankContent;
  const [text, setText] = useState('');
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);

  const check = () => {
    const answer = text.trim().toLowerCase();
    const isCorrect = content.correct_answers.some(
      (candidate) => candidate.trim().toLowerCase() === answer
    );
    setLastCorrect(isCorrect);
    onCheck({ text }, isCorrect);
  };

  return (
    <>
      <TextInput
        style={styles.input}
        placeholder="Type your answer"
        autoCapitalize="none"
        autoCorrect={false}
        value={text}
        onChangeText={setText}
        editable={!checked}
      />

      {!checked && (
        <PrimaryButton label="Check" onPress={check} disabled={text.trim().length === 0 || busy} />
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
  input: {
    borderWidth: 2,
    borderColor: colors.grey,
    borderRadius: radius.card,
    padding: 14,
    fontSize: 16,
    fontFamily: fonts.body,
    color: colors.ink,
    backgroundColor: colors.paper,
  },
});