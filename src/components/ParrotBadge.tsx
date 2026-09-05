import { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '@/src/theme/tokens';

export function ParrotBadge({
  size = 72,
  backgroundColor = colors.sun,
  style,
  bob,
  bounceKey,
}: {
  size?: number;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
  bob?: boolean;
  bounceKey?: number;
}) {
  const bobAnim = useRef(new Animated.Value(0)).current;
  const bounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!bob) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bobAnim, { toValue: 1, duration: 1250, useNativeDriver: true }),
        Animated.timing(bobAnim, { toValue: 0, duration: 1250, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [bob, bobAnim]);

  useEffect(() => {
    if (bounceKey === undefined) return;
    bounce.setValue(0);
    Animated.sequence([
      Animated.spring(bounce, { toValue: 1, friction: 3, useNativeDriver: true }),
      Animated.spring(bounce, { toValue: 0, friction: 3, useNativeDriver: true }),
    ]).start();
  }, [bounceKey, bounce]);

  const scale = bounce.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] });
  const translateY = bobAnim.interpolate({ inputRange: [0, 1], outputRange: [-3, 3] });

  return (
    <Animated.View style={[{ transform: [{ scale }, { translateY }] }, style]}>
      <View
        style={[
          styles.circle,
          { width: size, height: size, borderRadius: size / 2, backgroundColor },
        ]}
      >
        <Image source={require('@/assets/images/mascot.png')} style={styles.image} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});