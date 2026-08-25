import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts } from '@/src/theme/tokens';

export function OptionCard({
  label,
  selected,
  disabled,
  compact,
  onPress,
}: {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  compact?: boolean;
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
        onPress={onPress}
        disabled={disabled}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[styles.card, compact && styles.compact, selected && styles.selected]}
      >
        <Text style={styles.label}>{label}</Text>
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
  label: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.ink,
  },
});