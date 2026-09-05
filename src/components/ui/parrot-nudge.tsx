import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { ParrotBadge } from '@/src/components/ParrotBadge';
import { correctLine, wrongLine } from '@/src/lib/voice';
import { colors, fonts, radius } from '@/src/theme/tokens';

export function ParrotNudge({
  correct,
  bounceKey,
}: {
  correct: boolean;
  bounceKey?: number;
}) {
  const [line] = useState(() => (correct ? correctLine() : wrongLine()));
  const drop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(drop, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [drop]);

  return (
    <Animated.View
      style={[
        styles.row,
        {
          opacity: drop,
          transform: [
            { translateY: drop.interpolate({ inputRange: [0, 1], outputRange: [-40, 0] }) },
          ],
        },
      ]}
    >
      <View style={styles.bubble}>
        <Text style={styles.text}>{line}</Text>
      </View>
      <ParrotBadge size={64} bounceKey={bounceKey} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  bubble: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.grey,
    borderRadius: radius.bubble,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  text: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
  },
});