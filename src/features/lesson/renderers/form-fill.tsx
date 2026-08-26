import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { OptionCard } from '@/src/components/ui/option-card';
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
          .map((field) => field.prompt.replace('___', `"${field.options[field.correct_index]}"`));
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
      <View style={styles.card}>
        {content.title ? <Text style={styles.cardTitle}>{content.title}</Text> : null}

        {content.text_to_speak ? (
          <View style={styles.audioRow}>
            <SpeakerButton onPress={() => speak(content.text_to_speak as string)} />
            <SlowButton onPress={() => speak(content.text_to_speak as string, 0.6)} />
          </View>
        ) : null}

        {content.fields.map((field, fi) => {
          const parts = field.prompt.split('___');
          const value = answers[fi];
          return (
            <View key={fi} style={styles.field}>
              <Text style={styles.prompt}>
                {parts[0]}
                <Text style={[styles.slot, value !== null && styles.slotFilled]}>
                  {value !== null ? field.options[value] : '___'}
                </Text>
                {parts.slice(1).join('')}
              </Text>
              <View style={styles.options}>
                {field.options.map((option, oi) => (
                  <View key={oi} style={styles.optionSpacing}>
                    <OptionCard
                      compact
                      label={option}
                      selected={value === oi}
                      disabled={checked}
                      onPress={() => select(fi, oi)}
                    />
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.grey,
    borderRadius: radius.card,
    padding: 20,
  },
  cardTitle: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.ink,
    marginBottom: 12,
  },
  audioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  field: {
    marginBottom: 16,
  },
  prompt: {
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
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionSpacing: {
    marginRight: 8,
    marginBottom: 8,
  },
});