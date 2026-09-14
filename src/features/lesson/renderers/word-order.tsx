import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Chip } from '@/src/components/ui/chip';
import { TapAnswerBank } from '@/src/components/ui/tap-answer-bank';
import type {
  ExerciseRendererHandle,
  ExerciseRendererProps,
  WordOrderContent,
} from '@/src/features/lesson/content';

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

export const WordOrderRenderer = forwardRef<ExerciseRendererHandle, ExerciseRendererProps>(
  function WordOrderRenderer({ exercise, checked, onCheck, onCanCheckChange }, ref) {
    const content = exercise.content as unknown as WordOrderContent;
    const [bankOrder] = useState(() => shuffledSequence(content.correct_sequence));
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

    return (
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
    );
  }
);