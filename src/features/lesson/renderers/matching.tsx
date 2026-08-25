import { forwardRef, Fragment, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Chip } from '@/src/components/ui/chip';
import type {
  ExerciseRendererHandle,
  ExerciseRendererProps,
  MatchingContent,
} from '@/src/features/lesson/content';
import { colors, radius } from '@/src/theme/tokens';

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

interface PillAnims {
  scale: Animated.Value;
  opacity: Animated.Value;
  shakeX: Animated.Value;
  leafFlash: Animated.Value;
  coralFlash: Animated.Value;
}

function makeAnims(): PillAnims {
  return {
    scale: new Animated.Value(1),
    opacity: new Animated.Value(1),
    shakeX: new Animated.Value(0),
    leafFlash: new Animated.Value(0),
    coralFlash: new Animated.Value(0),
  };
}

const SHAKE_VALUES = [-6, 6, -6, 6, -6, 6, 0];
const CORRECT_LOCK_MS = 750;
const WRONG_LOCK_MS = 500;

export const MatchingRenderer = forwardRef<ExerciseRendererHandle, ExerciseRendererProps>(
  function MatchingRenderer({ exercise, checked, onCheck, onProgressChange }, ref) {
    const content = exercise.content as unknown as MatchingContent;
    const rightItems = useMemo(() => shuffle(content.pairs.map((p) => p.right)), [content]);
    const anims = useMemo(() => {
      const map = new Map<string, PillAnims>();
      for (const pair of content.pairs) {
        map.set(pair.left, makeAnims());
        map.set(pair.right, makeAnims());
      }
      return map;
    }, [content]);

    const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
    const [matchedLefts, setMatchedLefts] = useState<Set<string>>(new Set());
    const [mistakes, setMistakes] = useState(0);
    const [locked, setLocked] = useState(false);
    const reportedRef = useRef(false);

    const matchedRights = new Set(
      content.pairs.filter((p) => matchedLefts.has(p.left)).map((p) => p.right)
    );
    const remaining = content.pairs.length - matchedLefts.size;

    useEffect(() => {
      onProgressChange?.(remaining);
    }, [remaining, onProgressChange]);

    useImperativeHandle(ref, () => ({ check: () => {} }));

    const animateMatched = (left: string, right: string) => {
      const l = anims.get(left)!;
      const r = anims.get(right)!;
      Animated.parallel([
        Animated.sequence([
          Animated.timing(l.leafFlash, { toValue: 1, duration: 100, useNativeDriver: true }),
          Animated.delay(350),
          Animated.timing(l.leafFlash, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(r.leafFlash, { toValue: 1, duration: 100, useNativeDriver: true }),
          Animated.delay(350),
          Animated.timing(r.leafFlash, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.delay(450),
          Animated.parallel([
            Animated.timing(l.opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
            Animated.timing(l.scale, { toValue: 0.7, duration: 300, useNativeDriver: true }),
            Animated.timing(r.opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
            Animated.timing(r.scale, { toValue: 0.7, duration: 300, useNativeDriver: true }),
          ]),
        ]),
      ]).start();
    };

    const animateWrong = (left: string, right: string) => {
      const l = anims.get(left)!;
      const r = anims.get(right)!;
      Animated.parallel([
        Animated.sequence(
          SHAKE_VALUES.map((v) =>
            Animated.timing(l.shakeX, { toValue: v, duration: 70, useNativeDriver: true })
          )
        ),
        Animated.sequence(
          SHAKE_VALUES.map((v) =>
            Animated.timing(r.shakeX, { toValue: v, duration: 70, useNativeDriver: true })
          )
        ),
        Animated.sequence([
          Animated.timing(l.coralFlash, { toValue: 1, duration: 100, useNativeDriver: true }),
          Animated.delay(300),
          Animated.timing(l.coralFlash, { toValue: 0, duration: 100, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(r.coralFlash, { toValue: 1, duration: 100, useNativeDriver: true }),
          Animated.delay(300),
          Animated.timing(r.coralFlash, { toValue: 0, duration: 100, useNativeDriver: true }),
        ]),
      ]).start();
    };

    const reportIfDone = (nextMatched: Set<string>, nextMistakes: number) => {
      if (nextMatched.size === content.pairs.length && !reportedRef.current) {
        reportedRef.current = true;
        const correct = nextMistakes === 0;
        onCheck(
          { pairs: content.pairs },
          correct,
          {
            correct,
            title: correct ? 'Perfect!' : `Done with ${nextMistakes} mistakes`,
            explanation: content.pairs.map((p) => `${p.left} – ${p.right}`).join(', '),
            correctAnswer: null,
          }
        );
      }
    };

    const tapLeft = (left: string) => {
      if (checked || locked || matchedLefts.has(left)) return;
      setSelectedLeft((prev) => (prev === left ? null : left));
    };

    const tapRight = (right: string) => {
      if (checked || locked || !selectedLeft || matchedRights.has(right)) return;
      const expected = content.pairs.find((p) => p.left === selectedLeft);
      if (expected && expected.right === right) {
        const left = selectedLeft;
        const currentMistakes = mistakes;
        setSelectedLeft(null);
        animateMatched(left, right);
        setLocked(true);
        setTimeout(() => {
          const nextMatched = new Set(matchedLefts).add(left);
          setMatchedLefts(nextMatched);
          setLocked(false);
          reportIfDone(nextMatched, currentMistakes);
        }, CORRECT_LOCK_MS);
      } else {
        const left = selectedLeft;
        animateWrong(left, right);
        setLocked(true);
        setTimeout(() => {
          setSelectedLeft(null);
          setMistakes((m) => m + 1);
          setLocked(false);
        }, WRONG_LOCK_MS);
      }
    };

    const renderPill = (
      label: string,
      matched: boolean,
      selected: boolean,
      onPress: () => void,
      word: string
    ) => {
      const a = anims.get(word)!;
      return (
        <Animated.View
          style={[
            styles.pillWrap,
            {
              opacity: a.opacity,
              transform: [{ scale: a.scale }, { translateX: a.shakeX }],
            },
          ]}
        >
          <Chip
            label={label}
            centered
            selected={selected}
            disabled={checked || matched}
            onPress={onPress}
          />
          <Animated.View
            pointerEvents="none"
            style={[
              styles.flash,
              {
                backgroundColor: colors.leafTint,
                opacity: a.leafFlash.interpolate({ inputRange: [0, 1], outputRange: [0, 0.55] }),
              },
            ]}
          />
          <Animated.View
            pointerEvents="none"
            style={[
              styles.flash,
              {
                backgroundColor: colors.coralTint,
                opacity: a.coralFlash.interpolate({ inputRange: [0, 1], outputRange: [0, 0.55] }),
              },
            ]}
          />
        </Animated.View>
      );
    };

    return (
      <View style={styles.columns}>
        <View style={styles.column}>
          {content.pairs.map((pair) => (
            <Fragment key={pair.left}>
              {renderPill(
                pair.left,
                matchedLefts.has(pair.left),
                selectedLeft === pair.left,
                () => tapLeft(pair.left),
                pair.left
              )}
            </Fragment>
          ))}
        </View>
        <View style={styles.column}>
          {rightItems.map((right) => (
            <Fragment key={right}>
              {renderPill(right, matchedRights.has(right), false, () => tapRight(right), right)}
            </Fragment>
          ))}
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  columns: {
    flexDirection: 'row',
  },
  column: {
    flex: 1,
    marginRight: 8,
  },
  pillWrap: {
    position: 'relative',
    marginBottom: 8,
  },
  flash: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.button,
  },
});