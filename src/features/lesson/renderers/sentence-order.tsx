import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { OptionCard } from '@/src/components/ui/option-card';
import { TapAnswerBank } from '@/src/components/ui/tap-answer-bank';
import type {
  ExerciseRendererHandle,
  ExerciseRendererProps,
  SentenceOrderContent,
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

export const SentenceOrderRenderer = forwardRef<ExerciseRendererHandle, ExerciseRendererProps>(
  function SentenceOrderRenderer({ exercise, checked, onCheck, onCanCheckChange }, ref) {
    const content = exercise.content as unknown as SentenceOrderContent;
    const [order] = useState(() => shuffledSequence(content.correct_sequence));
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
            correctAnswer: content.correct_sequence.join(' • '),
            chips: null,
          }
        );
      },
    }));

    useEffect(() => {
      onCanCheckChange(answer.length === order.length);
    }, [answer, order, onCanCheckChange]);

    return (
      <TapAnswerBank
        items={order}
        answer={answer}
        checked={checked}
        stacked
        emptyHint="Tap the sentences below"
        renderBankItem={(line, disabled, onPress) => (
          <OptionCard label={line} align="left" disabled={disabled} onPress={onPress} />
        )}
        renderAnswerItem={(line, onPress) => (
          <OptionCard label={line} align="left" disabled={checked} onPress={onPress} />
        )}
        onTapBank={(line) => setAnswer((prev) => [...prev, line])}
        onTapAnswer={(line) => setAnswer((prev) => prev.filter((w) => w !== line))}
      />
    );
  }
);