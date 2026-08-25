import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts, radius } from '@/src/theme/tokens';

export function Chip({
  label,
  onPress,
  centered,
  selected,
  disabled,
}: {
  label: string;
  onPress: () => void;
  centered?: boolean;
  selected?: boolean;
  disabled?: boolean;
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
        style={[styles.chip, selected && styles.selected]}
      >
        <Text
          style={[styles.label, centered && styles.centered]}
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