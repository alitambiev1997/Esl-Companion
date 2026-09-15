import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Alert, Animated, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius } from '@/src/theme/tokens';

export function TopBar({ progress, onClose }: { progress: number; onClose: () => void }) {
  const fill = useRef(new Animated.Value(progress)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const prevProgressRef = useRef<number | null>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    Animated.spring(fill, {
      toValue: progress,
      friction: 8,
      tension: 60,
      useNativeDriver: false,
    }).start();

    if (prevProgressRef.current !== null && progress !== prevProgressRef.current) {
      pulse.setValue(0);
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 150, useNativeDriver: false }),
        Animated.timing(pulse, { toValue: 0, duration: 150, useNativeDriver: false }),
      ]).start();
    }
    prevProgressRef.current = progress;
  }, [progress, fill, pulse]);

  const confirmLeave = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Leave lesson? This attempt is not saved.')) {
        onClose();
      }
      return;
    }
    Alert.alert('Leave lesson?', 'This attempt is not saved.', [
      { text: 'Stay', style: 'cancel' },
      { text: 'Leave', style: 'destructive', onPress: onClose },
    ]);
  };

  return (
    <View style={[styles.bar, { paddingTop: insets.top + 12, paddingBottom: 12 }]}>
      <Pressable style={styles.close} onPress={confirmLeave} hitSlop={8}>
        <Ionicons name="close" size={24} color={colors.ink} />
      </Pressable>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            {
              width: fill.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
            },
          ]}
        />
        <Animated.View
          pointerEvents="none"
          style={[
            styles.pulseLayer,
            { opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0, 0.45] }) },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  close: {
    marginRight: 16,
  },
  track: {
    flex: 1,
    height: 12,
    borderRadius: radius.button,
    backgroundColor: colors.grey,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.button,
    backgroundColor: colors.sky,
  },
  pulseLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.white,
  },
});