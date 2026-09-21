import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import type {
  ExerciseRendererHandle,
  ExerciseRendererProps,
  FillBlankContent,
} from '@/src/features/lesson/content';
import { colors, fonts } from '@/src/theme/tokens';

export const FillBlankRenderer = forwardRef<ExerciseRendererHandle, ExerciseRendererProps>(
  function FillBlankRenderer({ exercise, checked, onCheck, onCanCheckChange }, ref) {
    const content = exercise.content as unknown as FillBlankContent;
    const [text, setText] = useState('');
    const parts = exercise.prompt.split('___');

    useImperativeHandle(ref, () => ({
      check: () => {
        const answer = text.trim().toLowerCase();
        const isCorrect = content.correct_answers.some(
          (candidate) => candidate.trim().toLowerCase() === answer
        );
        onCheck(
          { text },
          isCorrect,
          {
            correct: isCorrect,
            explanation: content.explanation,
            correctAnswer: content.correct_answers.join(' or '),
          }
        );
      },
    }));

    useEffect(() => {
      onCanCheckChange(text.trim().length > 0);
    }, [text, onCanCheckChange]);

    return (
      <>
        <Text style={styles.sentence}>
          {parts[0]}
          {parts.length > 1 && (
            <Text style={[styles.gap, checked && styles.gapRevealed]}>
              {checked && content.correct_answers[0] ? content.correct_answers[0] : '___'}
            </Text>
          )}
          {parts.slice(1).join('')}
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Type your answer"
          placeholderTextColor={colors.greyDark}
          autoCapitalize="none"
          autoCorrect={false}
          value={text}
          onChangeText={setText}
          editable={!checked}
        />
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
  gap: {
    textDecorationLine: 'underline',
    fontWeight: '700',
  },
  gapRevealed: {
    color: colors.leaf,
  },
  input: {
    fontSize: 20,
    fontFamily: fonts.body,
    color: colors.ink,
    borderBottomWidth: 2,
    borderColor: colors.grey,
    paddingVertical: 10,
    paddingHorizontal: 0,
  },
});