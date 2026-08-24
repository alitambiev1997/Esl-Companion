import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import type { ExerciseRendererProps, MultipleChoiceContent } from '@/src/features/lesson/content';
import { FeedbackPanel } from '@/src/features/lesson/feedback-panel';
import { ContinueButton, PrimaryButton } from '@/src/features/lesson/flow-buttons';
import { colors, fonts, radius } from '@/src/theme/tokens';

export function MultipleChoiceRenderer({
  exercise,
  checked,
  busy,
  isLast,
  onCheck,
  onContinue,
}: ExerciseRendererProps) {
  const content = exercise.content as unknown as MultipleChoiceContent;
  const [selected, setSelected] = useState<number | null>(null);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);

  const check = () => {
    if (selected === null) return;
    const isCorrect = selected === content.correct_index;
    setLastCorrect(isCorrect);
    onCheck({ selected_index: selected }, isCorrect);
  };

  return (
    <>
      {content.options.map((option, i) => {
        const isSelected = selected === i;
        const isThisCorrect = i === content.correct_index;
        const isThisWrongPick = checked && isSelected && !isThisCorrect;

        return (
          <Pressable
            key={i}
            style={[
              styles.option,
              isSelected && styles.optionSelected,
              checked && isThisCorrect && styles.optionCorrect,
              checked && isThisWrongPick && styles.optionWrong,
            ]}
            onPress={() => {
              if (!checked) setSelected(i);
            }}
            disabled={checked}
          >
            <Text style={styles.optionText}>{option}</Text>
          </Pressable>
        );
      })}

      {!checked && (
        <PrimaryButton
          label="Check"
          onPress={check}
          disabled={selected === null || busy}
        />
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
  option: {
    borderWidth: 2,
    borderColor: colors.grey,
    borderRadius: radius.card,
    padding: 14,
    marginBottom: 8,
    backgroundColor: colors.paper,
  },
  optionSelected: {
    borderColor: colors.sky,
  },
  optionCorrect: {
    borderColor: colors.leaf,
    backgroundColor: colors.leafTint,
  },
  optionWrong: {
    borderColor: colors.coral,
    backgroundColor: colors.coralTint,
  },
  optionText: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.ink,
  },
});