import { Ionicons } from '@expo/vector-icons';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChatBubbles, type ChatLine } from '@/src/components/ui/chat-bubbles';
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

  const lines: ChatLine[] =
    content.dialogue && content.dialogue.length > 0
      ? content.dialogue.map((line) => ({
          text: line.text,
          left: line.side !== 'right',
          speaker: line.speaker,
        }))
      : (content.bubbles ?? []).map((bubble, i) => ({
          text: bubble,
          left: i % 2 === 0,
        }));

  const passage = () => content.text_to_speak ?? lines.map((line) => line.text).join(' ');

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

      <ChatBubbles lines={lines} />

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