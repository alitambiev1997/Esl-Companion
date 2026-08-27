import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Chip } from '@/src/components/ui/chip';
import { lightHaptic } from '@/src/lib/haptics';
import { colors, fonts } from '@/src/theme/tokens';

export function FeedbackBanner({
  correct,
  explanation,
  correctAnswer,
  onContinue,
  continueLabel,
  title,
  chips,
  tip,
}: {
  correct: boolean;
  explanation: string | null;
  correctAnswer: string | null;
  onContinue: () => void;
  continueLabel?: string;
  title?: string;
  chips?: string[] | null;
  tip?: string | null;
}) {
  const insets = useSafeAreaInsets();
  const slide = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(slide, { toValue: 0, useNativeDriver: true }).start();
  }, [slide]);

  return (
    <Animated.View
      style={[
        styles.banner,
        {
          backgroundColor: correct ? colors.leafTint : colors.coralTint,
          paddingBottom: Math.max(insets.bottom, 20),
          transform: [
            { translateY: slide.interpolate({ inputRange: [0, 1], outputRange: [0, 400] }) },
          ],
        },
      ]}
    >
      <Text style={styles.title}>{title ?? (correct ? 'Nicely done!' : 'Not quite')}</Text>
      {explanation && <Text style={styles.text}>{explanation}</Text>}
      {tip && <Text style={styles.tip}>{tip}</Text>}
      {!correct && chips && chips.length > 0 && (
        <View style={styles.chipsRow}>
          {chips.map((chip) => (
            <Chip key={chip} label={chip} centered onPress={() => {}} disabled />
          ))}
        </View>
      )}
      {!correct && !chips && correctAnswer && (
        <Text style={styles.answer}>Correct answer: {correctAnswer}</Text>
      )}
      <Pressable
        style={[styles.button, { backgroundColor: correct ? colors.leaf : colors.coral }]}
        onPress={() => {
          lightHaptic();
          onContinue();
        }}
      >
        <Text style={styles.buttonText}>{continueLabel ?? 'Continue'}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingTop: 24,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.ink,
    marginBottom: 4,
  },
  text: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
  },
  tip: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.ink,
    opacity: 0.6,
    marginTop: 4,
  },
  answer: {
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
    marginTop: 4,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  button: {
    borderRadius: 14,
    paddingVertical: 14,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  buttonText: {
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});