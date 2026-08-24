import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type {
  ExerciseRendererProps,
  MatchingContent,
  MatchingPair,
} from '@/src/features/lesson/content';
import { FeedbackPanel } from '@/src/features/lesson/feedback-panel';
import { ContinueButton, PrimaryButton } from '@/src/features/lesson/flow-buttons';
import { colors, fonts, radius } from '@/src/theme/tokens';

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function MatchingRenderer({
  exercise,
  checked,
  busy,
  isLast,
  onCheck,
  onContinue,
}: ExerciseRendererProps) {
  const content = exercise.content as unknown as MatchingContent;
  const rightItems = useMemo(() => shuffle(content.pairs.map((p) => p.right)), [content]);

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [pairs, setPairs] = useState<MatchingPair[]>([]);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);

  const tapLeft = (left: string) => {
    if (checked) return;
    if (pairs.some((p) => p.left === left)) return;
    setSelectedLeft((prev) => (prev === left ? null : left));
  };

  const tapRight = (right: string) => {
    if (checked) return;
    if (pairs.some((p) => p.right === right)) {
      setPairs((prev) => prev.filter((p) => p.right !== right));
      return;
    }
    if (!selectedLeft) return;
    setPairs((prev) => [...prev, { left: selectedLeft, right }]);
    setSelectedLeft(null);
  };

  const check = () => {
    const wrongPairs = pairs.filter((p) => {
      const expected = content.pairs.find((c) => c.left === p.left);
      return !expected || expected.right !== p.right;
    });
    const isCorrect = pairs.length === content.pairs.length && wrongPairs.length === 0;
    setLastCorrect(isCorrect);
    onCheck({ pairs }, isCorrect);
  };

  const wrongPairs = pairs.filter((p) => {
    const expected = content.pairs.find((c) => c.left === p.left);
    return !expected || expected.right !== p.right;
  });
  const wrongLefts = checked ? new Set(wrongPairs.map((p) => p.left)) : new Set<string>();
  const wrongRights = checked ? new Set(wrongPairs.map((p) => p.right)) : new Set<string>();

  return (
    <>
      {content.pairs.map((pair) => {
        const paired = pairs.find((p) => p.left === pair.left);
        return (
          <View key={pair.left} style={styles.row}>
            <Pressable
              style={[
                styles.item,
                selectedLeft === pair.left && styles.itemSelected,
                paired &&
                  (wrongLefts.has(pair.left) ? styles.itemWrong : styles.itemPaired),
              ]}
              onPress={() => tapLeft(pair.left)}
            >
              <Text style={styles.itemText}>{pair.left}</Text>
            </Pressable>
            {rightItems.map((right) => {
              if (paired) {
                return right === paired.right ? (
                  <Pressable
                    key={right}
                    style={[
                      styles.item,
                      wrongRights.has(right) ? styles.itemWrong : styles.itemPaired,
                    ]}
                    onPress={() => tapRight(right)}
                  >
                    <Text style={styles.itemText}>{right}</Text>
                  </Pressable>
                ) : null;
              }
              const used = pairs.some((p) => p.right === right);
              return (
                <Pressable
                  key={right}
                  style={[styles.item, used && styles.itemDisabled]}
                  onPress={() => tapRight(right)}
                >
                  <Text style={styles.itemText}>{right}</Text>
                </Pressable>
              );
            })}
          </View>
        );
      })}

      {!checked && (
        <PrimaryButton
          label="Check"
          onPress={check}
          disabled={pairs.length !== content.pairs.length || busy}
        />
      )}

      {checked && (
        <>
          <FeedbackPanel
            isCorrect={lastCorrect === true}
            explanation={content.explanation}
            extra={
              wrongPairs.length > 0 ? (
                <Text style={styles.wrongList}>
                  Wrong pairs:{' '}
                  {wrongPairs.map((p) => `${p.left} – ${p.right}`).join(', ')}
                </Text>
              ) : null
            }
          />
          <ContinueButton isLast={isLast} onPress={onContinue} disabled={busy} />
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  item: {
    flex: 1,
    borderWidth: 2,
    borderColor: colors.grey,
    borderRadius: radius.card,
    padding: 12,
    backgroundColor: colors.paper,
    marginRight: 8,
  },
  itemSelected: {
    borderColor: colors.sky,
  },
  itemPaired: {
    borderColor: colors.leaf,
  },
  itemWrong: {
    borderColor: colors.coral,
    backgroundColor: colors.coralTint,
  },
  itemDisabled: {
    opacity: 0.4,
  },
  itemText: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.ink,
  },
  wrongList: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.coral,
    marginBottom: 4,
  },
});