import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Chip } from '@/src/components/ui/chip';
import { SlowButton, SpeakerButton } from '@/src/components/ui/speaker-button';
import { TapAnswerBank } from '@/src/components/ui/tap-answer-bank';
import type {
  ExerciseRendererHandle,
  ExerciseRendererProps,
  ListeningWordOrderContent,
} from '@/src/features/lesson/content';
import { speak, stopSpeech } from '@/src/lib/tts';

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function shuffledSequence(seq: string[]): string[] {
  const result = shuffle(seq);
  if (result.every((w, i) => w === seq[i]) && result.length > 1) {
    [result[0], result[1]] = [result[1], result[0]];
  }
  return result;
}

export const ListeningWordOrderRenderer = forwardRef<
  ExerciseRendererHandle,
  ExerciseRendererProps
>(function ListeningWordOrderRenderer({ exercise, checked, onCheck, onCanCheckChange }, ref) {
  const content = exercise.content as unknown as ListeningWordOrderContent;
  const [bankOrder] = useState(() => shuffledSequence(content.correct_sequence));
  const [answer, setAnswer] = useState<string[]>([]);

  useEffect(() => {
    speak(content.text_to_speak);
    return () => stopSpeech();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  return (
    <>
      <View style={styles.audioRow}>
        <SpeakerButton onPress={() => speak(content.text_to_speak)} />
        <SlowButton onPress={() => speak(content.text_to_speak, 0.6)} />
      </View>

      <TapAnswerBank
        items={bankOrder}
        answer={answer}
        checked={checked}
        renderBankItem={(word, disabled, onPress) => (
          <Chip label={word} centered disabled={disabled} onPress={onPress} />
        )}
        renderAnswerItem={(word, onPress) => (
          <Chip label={word} centered disabled={checked} onPress={onPress} />
        )}
        onTapBank={(word) => setAnswer((prev) => [...prev, word])}
        onTapAnswer={(word) => setAnswer((prev) => prev.filter((w) => w !== word))}
      />
    </>
  );
});

const styles = StyleSheet.create({
  audioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
});