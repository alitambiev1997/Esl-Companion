import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ChatBubbles, type ChatLine } from '@/src/components/ui/chat-bubbles';
import { OptionCard } from '@/src/components/ui/option-card';
import type {
  BestReplyContent,
  ExerciseRendererHandle,
  ExerciseRendererProps,
} from '@/src/features/lesson/content';
import { colors, fonts } from '@/src/theme/tokens';

const WRONG_FLASH_MS = 700;

export const BestReplyRenderer = forwardRef<ExerciseRendererHandle, ExerciseRendererProps>(
  function BestReplyRenderer({ exercise, checked, onCheck }, ref) {
    const content = exercise.content as unknown as BestReplyContent;
    const [stepIndex, setStepIndex] = useState(0);
    const [mistakes, setMistakes] = useState(0);
    const [pendingWrong, setPendingWrong] = useState<string | null>(null);
    const [wrongNote, setWrongNote] = useState<string | null>(null);
    const [advancing, setAdvancing] = useState(false);
    const reportedRef = useRef(false);

    const step = content.steps[stepIndex];

    const chatLines = useMemo<ChatLine[]>(() => {
      const lines: ChatLine[] = [];
      for (let si = 0; si <= stepIndex; si++) {
        for (const line of content.steps[si].lines) {
          lines.push({ text: line.text, left: false, speaker: line.speaker });
        }
        if (si < stepIndex) {
          lines.push({ text: content.steps[si].reply, left: true, speaker: 'You' });
        }
      }
      return lines;
    }, [content, stepIndex]);

    useImperativeHandle(ref, () => ({ check: () => {} }));

    const advance = (nextMistakes: number) => {
      setAdvancing(false);
      setMistakes(nextMistakes);
      if (stepIndex < content.steps.length - 1) {
        setStepIndex((s) => s + 1);
        return;
      }
      if (!reportedRef.current) {
        reportedRef.current = true;
        const correct = nextMistakes === 0;
        onCheck(
          { mistakes: nextMistakes },
          correct,
          {
            correct,
            title: correct ? 'Perfect conversation!' : `Done with ${nextMistakes} mistakes`,
            explanation: null,
            correctAnswer: null,
          }
        );
      }
    };

    const pick = (i: number) => {
      if (advancing || checked) return;
      const isCorrect = i === step.correct_index;
      const nextMistakes = mistakes + (isCorrect ? 0 : 1);
      if (isCorrect) {
        advance(nextMistakes);
        return;
      }
      setPendingWrong(step.options[i]);
      setWrongNote(step.explanation ?? null);
      setAdvancing(true);
      setTimeout(() => {
        setPendingWrong(null);
        setWrongNote(null);
        advance(nextMistakes);
      }, WRONG_FLASH_MS);
    };

    return (
      <>
        <ChatBubbles lines={chatLines} />

        <Text style={styles.stepLabel}>Choose the best reply:</Text>
        {step.options.map((option, i) => (
          <View key={i} style={styles.spacing}>
            <OptionCard
              label={option}
              wrong={pendingWrong === option}
              disabled={advancing || checked}
              onPress={() => pick(i)}
            />
          </View>
        ))}

        {wrongNote && <Text style={styles.wrongNote}>{wrongNote}</Text>}
      </>
    );
  }
);

const styles = StyleSheet.create({
  stepLabel: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.ink,
    marginTop: 16,
    marginBottom: 12,
  },
  spacing: {
    marginBottom: 12,
  },
  wrongNote: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.coral,
    marginTop: 8,
  },
});