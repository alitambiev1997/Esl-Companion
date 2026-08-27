import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import { tapHaptic } from '@/src/lib/haptics';
import { colors, fonts, radius } from '@/src/theme/tokens';

export function Chip({
  label,
  onPress,
  centered,
  selected,
  disabled,
  backgroundColor,
  large,
  wrong,
  tone,
}: {
  label: string;
  onPress: () => void;
  centered?: boolean;
  selected?: boolean;
  disabled?: boolean;
  backgroundColor?: string | Animated.AnimatedInterpolation<string | number>;
  large?: boolean;
  wrong?: boolean;
  tone?: 'leaf' | 'sun';
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
  };
  const onPressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale }] }, backgroundColor ? { backgroundColor } : null]}>
      <Pressable
        onPress={() => {
          tapHaptic();
          onPress();
        }}
        disabled={disabled}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[
          styles.chip,
          selected && !backgroundColor && styles.selected,
          wrong && styles.wrong,
          tone === 'leaf' && styles.toneLeaf,
          tone === 'sun' && styles.toneSun,
          large && styles.large,
          backgroundColor ? { backgroundColor: 'transparent' } : null,
        ]}
      >
        <Text
          style={[styles.label, centered && styles.centered, large && styles.labelLarge]}
          numberOfLines={2}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: radius.button,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.grey,
    borderBottomWidth: 4,
    borderBottomColor: colors.greyDark,
    paddingHorizontal: 16,
    paddingVertical: 10,
    margin: 4,
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
  large: {
    paddingHorizontal: 22,
    paddingVertical: 14,
  },
  labelLarge: {
    fontSize: 22,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.ink,
    includeFontPadding: false,
  },
  centered: {
    textAlign: 'center',
  },
});