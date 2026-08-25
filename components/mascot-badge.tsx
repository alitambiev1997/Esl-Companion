import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '@/src/theme/tokens';

export function MascotBadge({
  size = 72,
  backgroundColor = colors.sun,
  style,
}: {
  size?: number;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2, backgroundColor },
        style,
      ]}
    >
      <Image source={require('@/assets/images/mascot.png')} style={styles.image} />
    </View>
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