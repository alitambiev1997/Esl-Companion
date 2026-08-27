import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { successHaptic } from '@/src/lib/haptics';
import { medalColor, type Medal } from '@/src/lib/medals';
import { colors, fonts } from '@/src/theme/tokens';

const CONFETTI_COLORS = [colors.sky, colors.sun, colors.coral, colors.leaf];
const CONFETTI_COUNT = 27;

interface ConfettiPiece {
  id: number;
  progress: Animated.Value;
  dx: number;
  dy: number;
  size: number;
  delay: number;
  duration: number;
  color: string;
  shape: 'square' | 'circle';
  rotations: number;
  opacity: number;
}

export function Confetti({ origin }: { origin: { x: number; y: number } | null }) {
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  const pieces = useMemo<ConfettiPiece[]>(() => {
    if (!size || !origin) return [];
    const { width: W, height: H } = size;

    return Array.from({ length: CONFETTI_COUNT }, (_, i) => {
      const edge = Math.floor(Math.random() * 4);
      let tx: number;
      let ty: number;
      if (edge === 0) {
        tx = Math.random() * W;
        ty = 0;
      } else if (edge === 1) {
        tx = W;
        ty = Math.random() * H;
      } else if (edge === 2) {
        tx = Math.random() * W;
        ty = H;
      } else {
        tx = 0;
        ty = Math.random() * H;
      }

      return {
        id: i,
        progress: new Animated.Value(0),
        dx: tx - origin.x,
        dy: ty - origin.y,
        size: 6 + Math.random() * 6,
        delay: Math.random() * 200,
        duration: 1400 + Math.random() * 800,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        shape: i % 2 === 0 ? 'square' : 'circle',
        rotations: Math.random() * 3,
        opacity: 0.9 + Math.random() * 0.1,
      };
    });
  }, [size, origin]);

  useEffect(() => {
    if (pieces.length === 0) return;
    const animations = pieces.map((p) =>
      Animated.timing(p.progress, {
        toValue: 1,
        duration: p.duration,
        delay: p.delay,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      })
    );
    Animated.parallel(animations).start();
  }, [pieces]);

  if (!size || !origin) {
    return <View style={styles.layer} onLayout={(e) => setSize(e.nativeEvent.layout)} />;
  }

  return (
    <View
      style={styles.layer}
      pointerEvents="none"
      onLayout={(e) => setSize(e.nativeEvent.layout)}
    >
      {pieces.map((p) => (
        <Animated.View
          key={p.id}
          style={[
            styles.piece,
            p.shape === 'circle' && { borderRadius: p.size / 2 },
            {
              left: origin.x - p.size / 2,
              top: origin.y - p.size / 2,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              opacity: p.progress.interpolate({
                inputRange: [0, 0.7, 1],
                outputRange: [p.opacity, p.opacity, 0],
              }),
              transform: [
                {
                  translateX: p.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, p.dx],
                  }),
                },
                {
                  translateY: p.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, p.dy],
                  }),
                },
                {
                  rotate: p.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', `${p.rotations * 360}deg`],
                  }),
                },
                {
                  scale: p.progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0.6] }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

export function MedalStamp({ medal }: { medal: Medal }) {
  const scale = useRef(new Animated.Value(3)).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const color = medalColor(medal) ?? colors.sky;
  const rotate = rotation.interpolate({ inputRange: [0, 1], outputRange: ['-12deg', '0deg'] });

  useEffect(() => {
    Animated.parallel([
      Animated.sequence([
        Animated.spring(scale, { toValue: 1, friction: 4, tension: 80, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1.15, friction: 3, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }),
      ]),
      Animated.timing(rotation, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start(() => successHaptic());
  }, [scale, rotation]);

  return (
    <Animated.View
      style={[styles.stamp, { borderColor: color, transform: [{ scale }, { rotate }] }]}
    >
      <Text style={[styles.stampText, { color }]}>
        {medal.charAt(0).toUpperCase() + medal.slice(1)}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  piece: {
    position: 'absolute',
  },
  stamp: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    marginTop: 24,
  },
  stampText: {
    fontFamily: fonts.display,
    fontSize: 28,
  },
});