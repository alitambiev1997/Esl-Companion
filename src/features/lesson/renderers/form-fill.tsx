import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Chip } from '@/src/components/ui/chip';
import { SlowButton, SpeakerButton } from '@/src/components/ui/speaker-button';
import type {
  ExerciseRendererHandle,
  ExerciseRendererProps,
  FormFillContent,
} from '@/src/features/lesson/content';
import { speak, stopSpeech } from '@/src/lib/tts';
import { colors, fonts, radius } from '@/src/theme/tokens';

export const FormFillRenderer = forwardRef<ExerciseRendererHandle, ExerciseRendererProps>(
  function FormFillRenderer({ exercise, checked, onCheck, onCanCheckChange }, ref) {
    const content = exercise.content as unknown as FormFillContent;
    const [answers, setAnswers] = useState<(number | null)[]>(() =>
      content.fields.map(() => null)
    );

    useEffect(() => {
      if (!content.text_to_speak) return;
      speak(content.text_to_speak);
      return () => stopSpeech();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useImperativeHandle(ref, () => ({
      check: () => {
        const allCorrect = content.fields.every(
          (field, i) => answers[i] === field.correct_index
        );
        const wrongLines = content.fields
          .filter((field, i) => answers[i] !== field.correct_index)
          .map((field) => {
            const line = field.prompt.replace(
              '___',
              `"${field.options[field.correct_index]}"`
            );
            return field.explanation ? `${line} — ${field.explanation}` : line;
          });
        onCheck(
          { answers },
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
      onCanCheckChange(answers.every((a) => a !== null));
    }, [answers, onCanCheckChange]);

    const select = (fieldIndex: number, optionIndex: number) => {
      if (checked) return;
      setAnswers((prev) => {
        const next = [...prev];
        next[fieldIndex] = optionIndex;
        return next;
      });
    };

    return (
      <>
        {content.text_to_speak ? (
          <View style={styles.audioRow}>
            <SpeakerButton onPress={() => speak(content.text_to_speak as string)} />
            <SlowButton onPress={() => speak(content.text_to_speak as string, 0.6)} />
          </View>
        ) : null}

        <View style={styles.card}>
          {content.title ? <Text style={styles.cardTitle}>{content.title}</Text> : null}

          {content.fields.map((field, fi) => {
            const parts = field.prompt.split('___');
            const selected = answers[fi];
            const shown = checked
              ? field.options[field.correct_index]
              : selected !== null
                ? field.options[selected]
                : null;
            const isLineWrong = checked && selected !== field.correct_index;
            const isLineCorrect = checked && selected === field.correct_index;

            return (
              <View
                key={fi}
                style={[
                  styles.field,
                  isLineWrong && styles.lineWrong,
                  isLineCorrect && styles.lineCorrect,
                ]}
              >
                <Text style={styles.sentence}>
                  {parts[0]}
                  <Text style={[styles.slot, shown !== null && styles.slotFilled]}>
                    {shown ?? '___'}
                  </Text>
                  {parts.slice(1).join('')}
                </Text>
                <View style={styles.chipsRow}>
                  {field.options.map((option, oi) => (
                    <Chip
                      key={`${option}-${oi}`}
                      label={option}
                      centered
                      selected={selected === oi}
                      disabled={checked}
                      onPress={() => select(fi, oi)}
                    />
                  ))}
                </View>
              </View>
            );
          })}
        </View>
      </>
    );
  }
);

const styles = StyleSheet.create({
  audioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.grey,
    borderRadius: radius.card,
    padding: 16,
  },
  cardTitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: colors.greyDark,
    marginBottom: 16,
  },
  field: {
    marginBottom: 16,
  },
  lineWrong: {
    backgroundColor: colors.coralTint,
    borderRadius: 8,
    padding: 8,
  },
  lineCorrect: {
    backgroundColor: colors.leafTint,
    borderRadius: 8,
    padding: 8,
  },
  sentence: {
    fontFamily: fonts.body,
    fontSize: 17,
    lineHeight: 24,
    color: colors.ink,
    marginBottom: 8,
  },
  slot: {
    textDecorationLine: 'underline',
    color: colors.ink,
    opacity: 0.4,
  },
  slotFilled: {
    opacity: 1,
    fontWeight: '700',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});