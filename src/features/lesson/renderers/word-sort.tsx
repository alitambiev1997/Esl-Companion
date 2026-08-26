import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Chip } from '@/src/components/ui/chip';
import type {
  ExerciseRendererHandle,
  ExerciseRendererProps,
  WordSortContent,
} from '@/src/features/lesson/content';
import { colors, fonts, radius } from '@/src/theme/tokens';

export const WordSortRenderer = forwardRef<ExerciseRendererHandle, ExerciseRendererProps>(
  function WordSortRenderer({ exercise, checked, onCheck, onCanCheckChange }, ref) {
    const content = exercise.content as unknown as WordSortContent;
    const [assigned, setAssigned] = useState<Record<string, 0 | 1>>({});
    const [selectedWord, setSelectedWord] = useState<string | null>(null);

    const pool = content.items.filter((item) => assigned[item.word] === undefined);

    useImperativeHandle(ref, () => ({
      check: () => {
        const allCorrect = content.items.every((item) => assigned[item.word] === item.category);
        const bins = [0, 1]
          .map(
            (c) =>
              `${content.categories[c]}: ${content.items
                .filter((i) => i.category === c)
                .map((i) => i.word)
                .join(', ')}`
          )
          .join(' • ');
        onCheck(
          { assigned },
          allCorrect,
          {
            correct: allCorrect,
            explanation: content.explanation,
            correctAnswer: allCorrect ? null : bins,
          }
        );
      },
    }));

    useEffect(() => {
      onCanCheckChange(Object.keys(assigned).length === content.items.length);
    }, [assigned, content, onCanCheckChange]);

    const tapPool = (word: string) => {
      if (checked) return;
      setSelectedWord((prev) => (prev === word ? null : word));
    };

    const tapBin = (bin: 0 | 1) => {
      if (checked || !selectedWord) return;
      setAssigned((prev) => ({ ...prev, [selectedWord]: bin }));
      setSelectedWord(null);
    };

    const tapAssigned = (word: string) => {
      if (checked) return;
      setAssigned((prev) => {
        const next = { ...prev };
        delete next[word];
        return next;
      });
    };

    return (
      <>
        <View style={styles.binsRow}>
          {([0, 1] as const).map((bin) => (
            <Pressable key={bin} style={styles.binCard} onPress={() => tapBin(bin)} disabled={checked}>
              <Text style={styles.binTitle}>{content.categories[bin]}</Text>
              <View style={styles.binChips}>
                {content.items
                  .filter((item) => assigned[item.word] === bin)
                  .map((item) => {
                    const wrong = checked && assigned[item.word] !== item.category;
                    return (
                      <Chip
                        key={item.word}
                        label={item.word}
                        centered
                        wrong={wrong}
                        disabled={checked}
                        onPress={() => tapAssigned(item.word)}
                      />
                    );
                  })}
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.pool}>
          {pool.map((item) => (
            <Chip
              key={item.word}
              label={item.word}
              centered
              selected={selectedWord === item.word}
              disabled={checked}
              onPress={() => tapPool(item.word)}
            />
          ))}
        </View>
      </>
    );
  }
);

const styles = StyleSheet.create({
  binsRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  binCard: {
    flex: 1,
    minHeight: 120,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.grey,
    borderRadius: radius.card,
    padding: 12,
    marginRight: 8,
  },
  binTitle: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.ink,
    marginBottom: 8,
  },
  binChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  pool: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});