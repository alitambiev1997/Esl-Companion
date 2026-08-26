import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ContentImage } from '@/src/components/ui/content-image';
import { OptionCard } from '@/src/components/ui/option-card';
import type {
  DocumentReaderContent,
  ExerciseRendererHandle,
  ExerciseRendererProps,
} from '@/src/features/lesson/content';
import { contentImageUrl } from '@/src/lib/storage';
import { colors, fonts, radius } from '@/src/theme/tokens';

export const DocumentReaderRenderer = forwardRef<ExerciseRendererHandle, ExerciseRendererProps>(
  function DocumentReaderRenderer({ exercise, checked, onCheck, onCanCheckChange }, ref) {
    const content = exercise.content as unknown as DocumentReaderContent;
    const [questionIndex, setQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<(number | null)[]>(() =>
      content.questions.map(() => null)
    );
    const [selected, setSelected] = useState<number | null>(null);

    const current = content.questions[questionIndex];

    useImperativeHandle(ref, () => ({
      check: () => {
        if (selected === null) return;
        const nextAnswers = [...answers];
        nextAnswers[questionIndex] = selected;
        setAnswers(nextAnswers);
        if (questionIndex < content.questions.length - 1) {
          setQuestionIndex((q) => q + 1);
          setSelected(null);
          return;
        }
        const allCorrect = content.questions.every(
          (q, i) => nextAnswers[i] === q.correct_index
        );
        const wrongLines = content.questions
          .filter((q, i) => nextAnswers[i] !== q.correct_index)
          .map((q) => `${q.question} — ${q.options[q.correct_index]}`);
        onCheck(
          { answers: nextAnswers },
          allCorrect,
          {
            correct: allCorrect,
            explanation: content.explanation,
            correctAnswer: allCorrect ? null : wrongLines.join(' • '),
          }
        );
      },
    }));

    useEffect(() => {
      onCanCheckChange(selected !== null);
    }, [selected, onCanCheckChange]);

    return (
      <>
        {content.image_url ? (
          <ContentImage url={contentImageUrl(content.image_url)} />
        ) : content.document_lines ? (
          <View style={styles.documentCard}>
            {content.document_lines.map((line, i) => (
              <Text
                key={i}
                style={[styles.documentLine, i === 0 && styles.documentTitle]}
              >
                {line}
              </Text>
            ))}
          </View>
        ) : null}

        <Text style={styles.questionLabel}>
          Question {questionIndex + 1} of {content.questions.length}
        </Text>
        <Text style={styles.question}>{current.question}</Text>

        {current.options.map((option, i) => (
          <View key={i} style={styles.spacing}>
            <OptionCard
              label={option}
              selected={selected === i}
              disabled={checked}
              onPress={() => {
                if (!checked) setSelected(i);
              }}
            />
          </View>
        ))}
      </>
    );
  }
);

const styles = StyleSheet.create({
  documentCard: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.grey,
    borderRadius: radius.card,
    padding: 16,
    marginBottom: 24,
  },
  documentLine: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.ink,
    marginBottom: 4,
  },
  documentTitle: {
    fontFamily: fonts.display,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
  },
  questionLabel: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    opacity: 0.6,
    marginBottom: 4,
  },
  question: {
    fontFamily: fonts.body,
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 16,
  },
  spacing: {
    marginBottom: 12,
  },
});