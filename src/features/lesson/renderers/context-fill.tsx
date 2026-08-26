import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ChatBubbles, type ChatLine } from '@/src/components/ui/chat-bubbles';
import { OptionCard } from '@/src/components/ui/option-card';
import type {
  ContextFillContent,
  ExerciseRendererHandle,
  ExerciseRendererProps,
} from '@/src/features/lesson/content';
import { colors, fonts } from '@/src/theme/tokens';

export const ContextFillRenderer = forwardRef<ExerciseRendererHandle, ExerciseRendererProps>(
  function ContextFillRenderer({ exercise, checked, onCheck, onCanCheckChange }, ref) {
    const content = exercise.content as unknown as ContextFillContent;
    const [selected, setSelected] = useState<number | null>(null);
    const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);

    const lines: ChatLine[] = content.dialogue.map((line) => ({
      text: line.text,
      left: line.side !== 'right',
      speaker: line.speaker,
    }));
    const blankIndex = content.dialogue.findIndex((line) => line.text.includes('___'));

    useImperativeHandle(ref, () => ({
      check: () => {
        if (selected === null) return;
        const isCorrect = selected === content.correct_index;
        setLastCorrect(isCorrect);
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

    const renderLine = (line: ChatLine, index: number) => {
      if (index !== blankIndex) {
        return <Text style={styles.text}>{line.text}</Text>;
      }
      const parts = line.text.split('___');
      const fillColor =
        lastCorrect === null ? colors.ink : lastCorrect ? colors.leaf : colors.coral;
      return (
        <Text style={styles.text}>
          {parts[0]}
          <Text style={[styles.slot, { color: fillColor }]}>
            {lastCorrect === null
              ? '___'
              : content.options[content.correct_index]}
          </Text>
          {parts.slice(1).join('')}
        </Text>
      );
    };

    return (
      <>
        <ChatBubbles lines={lines} renderLine={renderLine} />

        <View style={styles.spacingTop} />

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
  }
);

const styles = StyleSheet.create({
  text: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
  },
  slot: {
    textDecorationLine: 'underline',
    fontWeight: '700',
  },
  spacingTop: {
    height: 16,
  },
  spacing: {
    marginBottom: 12,
  },
});