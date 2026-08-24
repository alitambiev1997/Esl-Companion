import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type {
  ExerciseRendererProps,
  ListeningMultipleChoiceContent,
} from '@/src/features/lesson/content';
import { FeedbackPanel } from '@/src/features/lesson/feedback-panel';
import { ContinueButton, PrimaryButton } from '@/src/features/lesson/flow-buttons';
import { speak, stopSpeech } from '@/src/lib/tts';
import { colors, fonts, radius } from '@/src/theme/tokens';

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function ListeningMultipleChoiceRenderer({
  exercise,
  checked,
  busy,
  isLast,
  onCheck,
  onContinue,
}: ExerciseRendererProps) {
  const content = exercise.content as unknown as ListeningMultipleChoiceContent;

  const [order] = useState(() => {
    const options = shuffle(content.options);
    const correct = options.indexOf(content.options[content.correct_index]);
    return { options, correctIndex: correct === -1 ? content.correct_index : correct };
  });
  const [selected, setSelected] = useState<number | null>(null);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    speak(content.text_to_speak);
    return () => stopSpeech();
  }, [content.text_to_speak]);

  const check = () => {
    if (selected === null) return;
    const isCorrect = selected === order.correctIndex;
    setLastCorrect(isCorrect);
    onCheck({ selected_index: selected }, isCorrect);
  };

  return (
    <>
      <View style={styles.audioRow}>
        <Pressable style={styles.audioButton} onPress={() => speak(content.text_to_speak)}>
          <Text style={styles.audioButtonText}>Play</Text>
        </Pressable>
        <Pressable style={styles.audioButton} onPress={() => speak(content.text_to_speak, 0.6)}>
          <Text style={styles.audioButtonText}>Slow</Text>
        </Pressable>
      </View>

      {order.options.map((option, i) => {
        const isSelected = selected === i;
        const isThisCorrect = i === order.correctIndex;
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
        <PrimaryButton label="Check" onPress={check} disabled={selected === null || busy} />
      )}

      {checked && (
        <>
          <FeedbackPanel isCorrect={lastCorrect === true} explanation={content.text_to_speak} />
          <ContinueButton isLast={isLast} onPress={onContinue} disabled={busy} />
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  audioRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  audioButton: {
    backgroundColor: colors.sky,
    borderRadius: radius.button,
    paddingHorizontal: 24,
    paddingVertical: 10,
    marginRight: 8,
  },
  audioButtonText: {
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
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