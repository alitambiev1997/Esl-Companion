import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { colors, fonts } from '@/src/theme/tokens';

export function Toast({ message }: { message: string | null }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!message) return;
    anim.setValue(0);
    Animated.spring(anim, { toValue: 1, useNativeDriver: true }).start();
  }, [message, anim]);

  if (!message) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.toast,
        {
          opacity: anim,
          transform: [
            { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [60, 0] }) },
          ],
        },
      ]}
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 100,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.coral,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
  },
  text: {
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '600',
    color: colors.coral,
  },
});