import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export function PopNumber({ value, children }: { value: number; children: React.ReactNode }) {
  const scale = useRef(new Animated.Value(1)).current;
  const prevRef = useRef<number | null>(null);

  useEffect(() => {
    if (prevRef.current === null) {
      prevRef.current = value;
      return;
    }
    if (prevRef.current !== value) {
      prevRef.current = value;
      scale.setValue(1);
      Animated.sequence([
        Animated.spring(scale, { toValue: 1.2, friction: 3, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 3, useNativeDriver: true }),
      ]).start();
    }
  }, [value, scale]);

  return <Animated.View style={{ transform: [{ scale }] }}>{children}</Animated.View>;
}