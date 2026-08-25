import { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';
import { medalColor, type Medal } from '@/src/lib/medals';
import { colors, fonts } from '@/src/theme/tokens';

const CONFETTI_COLORS = [colors.sky, colors.sun, colors.coral, colors.leaf];

interface ConfettiPiece {
  id: number;
  progress: Animated.Value;
  left: `${number}%`;
  size: number;
  delay: number;
  duration: number;
  color: string;
  rotate: string;
}

export function Confetti() {
  const pieces = useRef<ConfettiPiece[]>(
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      progress: new Animated.Value(0),
      left: `${Math.random() * 100}%`,
      size: 8 + Math.random() * 6,
      delay: Math.random() * 400,
      duration: 1100 + Math.random() * 700,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      rotate: `${Math.random() * 360}deg`,
    }))
  ).current;
  const fallDistance = Dimensions.get('window').height;

  useEffect(() => {
    const animations = pieces.map((p) =>
      Animated.timing(p.progress, {
        toValue: 1,
        duration: p.duration,
        delay: p.delay,
        useNativeDriver: true,
      })
    );
    Animated.parallel(animations).start();
  }, [pieces]);

  return (
    <View style={styles.layer} pointerEvents="none">
      {pieces.map((p) => (
        <Animated.View
          key={p.id}
          style={[
            styles.piece,
            {
              left: p.left,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              transform: [
                {
                  translateY: p.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, fallDistance],
                  }),
                },
                { rotate: p.rotate },
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
    ]).start();
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
  },
  piece: {
    position: 'absolute',
    top: -24,
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