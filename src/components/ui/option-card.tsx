import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import { tapHaptic } from '@/src/lib/haptics';
import { hoverStyle } from '@/src/lib/web-hover';
import { colors, fonts } from '@/src/theme/tokens';

export function OptionCard({
  label,
  selected,
  disabled,
  compact,
  align,
  wrong,
  tone,
  onPress,
}: {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  compact?: boolean;
  align?: 'center' | 'left';
  wrong?: boolean;
  tone?: 'leaf' | 'sun';
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
  };
  const onPressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={() => {
          tapHaptic();
          onPress();
        }}
        disabled={disabled}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={({ hovered }) => [
          styles.card,
          compact && styles.compact,
          selected && styles.selected,
          wrong && styles.wrong,
          tone === 'leaf' && styles.toneLeaf,
          tone === 'sun' && styles.toneSun,
          hoverStyle(hovered),
        ]}
      >
        <Text style={[styles.label, align === 'left' && styles.labelLeft]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 56,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.grey,
    borderBottomWidth: 4,
    borderBottomColor: colors.greyDark,
    padding: 12,
    justifyContent: 'center',
  },
  compact: {
    minHeight: 44,
    padding: 8,
  },
  selected: {
    borderColor: colors.sky,
    borderBottomColor: colors.sky,
    backgroundColor: colors.skyTint,
  },
  wrong: {
    borderColor: colors.coral,
    borderBottomColor: colors.coral,
    backgroundColor: colors.coralTint,
  },
  toneLeaf: {
    borderColor: colors.leaf,
    borderBottomColor: colors.leaf,
    backgroundColor: colors.leafTint,
  },
  toneSun: {
    borderColor: colors.sun,
    borderBottomColor: colors.sun,
    backgroundColor: colors.sunTint,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.ink,
  },
  labelLeft: {
    textAlign: 'left',
  },
});