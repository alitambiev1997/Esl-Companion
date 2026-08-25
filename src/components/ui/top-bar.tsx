import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Alert, Animated, Pressable, StyleSheet, View } from 'react-native';
import { colors, radius } from '@/src/theme/tokens';

export function TopBar({ progress, onClose }: { progress: number; onClose: () => void }) {
  const fill = useRef(new Animated.Value(progress)).current;

  useEffect(() => {
    Animated.timing(fill, { toValue: progress, duration: 300, useNativeDriver: false }).start();
  }, [progress, fill]);

  const confirmLeave = () => {
    Alert.alert('Leave lesson?', undefined, [
      { text: 'Stay', style: 'cancel' },
      { text: 'Leave', style: 'destructive', onPress: onClose },
    ]);
  };

  return (
    <View style={styles.bar}>
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
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
});