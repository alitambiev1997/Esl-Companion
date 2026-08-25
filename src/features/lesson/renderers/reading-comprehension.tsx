import { Ionicons } from '@expo/vector-icons';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { OptionCard } from '@/src/components/ui/option-card';
import type {
  ExerciseRendererHandle,
  ExerciseRendererProps,
  ReadingComprehensionContent,
} from '@/src/features/lesson/content';
import { speak, stopSpeech } from '@/src/lib/tts';
import { colors, fonts } from '@/src/theme/tokens';

export const ReadingComprehensionRenderer = forwardRef<
  ExerciseRendererHandle,
  ExerciseRendererProps
>(function ReadingComprehensionRenderer({ exercise, checked, onCheck, onCanCheckChange }, ref) {
  const content = exercise.content as unknown as ReadingComprehensionContent;
  const [selected, setSelected] = useState<number | null>(null);

  const passage = () => content.text_to_speak ?? content.bubbles.join(' ');

  useEffect(() => {
    speak(passage());
    return () => stopSpeech();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useImperativeHandle(ref, () => ({
    check: () => {
      if (selected === null) return;
      const isCorrect = selected === content.correct_index;
      onCheck(
        { selected_index: selected },
        isCorrect,
        {
          correct: isCorrect,
          explanation: content.explanation,
          correctAnswer: content.options[content.correct_index] ?? null,
        }
      );
    },
  }));

  useEffect(() => {
    onCanCheckChange(selected !== null);
  }, [selected, onCanCheckChange]);

  return (
    <>
      <Pressable style={styles.listenRow} onPress={() => speak(passage())} hitSlop={8}>
        <Ionicons name="volume-high" size={20} color={colors.sky} />
        <Text style={styles.listenText}>Listen</Text>
      </Pressable>

      {content.bubbles.map((bubble, i) => {
        const left = i % 2 === 0;
        return (
          <View
            key={i}
            style={[styles.bubbleRow, left ? styles.alignLeft : styles.alignRight]}
          >
            <View style={[styles.bubble, left ? styles.bubbleLeft : styles.bubbleRight]}>
              <Text style={styles.bubbleText}>{bubble}</Text>
            </View>
          </View>
        );
      })}

      <Text style={styles.question}>{content.question}</Text>

      {content.options.map((option, i) => (
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
});

const styles = StyleSheet.create({
  listenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  listenText: {
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '600',
    color: colors.sky,
    marginLeft: 6,
  },
  bubbleRow: {
    width: '100%',
    marginBottom: 4,
  },
  alignLeft: {
    alignItems: 'flex-start',
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 10,
  },
  bubbleLeft: {
    backgroundColor: colors.skyTint,
  },
  bubbleRight: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.grey,
  },
  bubbleText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
  },
  question: {
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
    marginTop: 16,
    marginBottom: 12,
  },
  spacing: {
    marginBottom: 12,
  },
});